const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Community = require('../models/communityModel');
const mongoose = require('mongoose');

const createUser = async (req, res) => {
    try {
        const { username, email, password, location, memberOf } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user instance without profilePic first
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            location,
            memberOf
        });

        // Save the user to the database
        await newUser.save();

        // Upload image to Cloudinary ONLY IF USER IS CREATED
        if (req.file) {
            // console.log("Uploading profile picture...");
            newUser.profilePic = req.file.path; // Multer automatically assigns path
            await newUser.save(); // Save updated user with profilePic URL
            // console.log("Profile picture uploaded successfully");
        }

        res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const userInfo = async (req, res) => {
    try {
        // Directly access req.user which was set by the authenticateUser middleware
        const user = req.user;

        // Send the user info in the response
        res.status(200).json({ user });

        // Optionally log user data for debugging
        // console.log(user);
    } catch (error) {
        // Handle errors if needed
        console.error("Error in userInfo:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// ------------------------------------------------------------------------------------------------------- PICTURE CHANGE
const pictureChange = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({ message: "cannot find user in database." });
    }

    const newPicture = req.file.path;

    if (!newPicture) {
        return res.status(400).json({ message: "no picture received." });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: newPicture }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ message: "profile picture updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "error occured" });
        console.log("profile update error: ", error);
    }
};


// ------------------------------------------------------------------------------------------------------- FETCH USER BY ID
const fetchUser = async (req, res) => {
    const userId = req.user?._id;

    try {
        if (!userId) {
            return res.status(404).json({ message: "No userId received." });
        }
        const user = await User.findById(userId);
        res.status(200).json({ user: user, message: "user fetched successfully." });
    } catch (error) {
        console.log("user fetching error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// ------------------------------------------------------------------------------------------------------- UPDATE USERNAME ONLY
const updateUsername = async (req, res) => {
    const userId = req.user?._id;
    const { oldPassword, newUsername } = req.body;

    if (!userId || userId == 'undefined') {
        return res.status(400).json({ message: "user is not defined" });
    }
    if (!newUsername || newUsername.trim() === "") {
        return res.status(400).json({ message: "Username cannot be empty" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: newUsername.trim() },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Username updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------------------------------------------------------------------------- UPDATE PASSWORD ONLY
const updatePassword = async (req, res) => {
    const userId = req.user?._id;
    const userPassword = req.user?.password;
    const { oldPassword, newPassword } = req.body;

    if (!userId || userId == 'undefined') {
        return res.status(400).json({ message: "User is not defined" });
    }

    if (!newPassword || newPassword.trim() === "") {
        return res.status(400).json({ message: "Password cannot be empty" });
    }

    // 1. Check old password
    const isMatch = await bcrypt.compare(oldPassword, userPassword);
    if (!isMatch) {
        return res.status(401).json({ message: "Old password didn't match" });
    }

    try {
        // ✅ Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------------------------------------------------------------------------- DELETE USER 
const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        const { uName } = req.body;

        if (user.username !== uName.trim()) {
            return res.status(404).json({ message: "Name doesn't match" });
        }

        // console.log("old creater:", user._id);

        const communities = await Community.find({ creater: user._id }); // use creater

        for (const community of communities) {
            // console.log("Community ID:", community._id, "Members:", community.members);

            if (community.members && community.members.length > 0) {
                const newCreaterId = community.members.find(
                    (memberId) => memberId.toString() !== user._id.toString()
                );

                if (newCreaterId) {
                    // Remove new creater from members list
                    // community.members = community.members.filter(
                    //     (memberId) => memberId.toString() !== newCreaterId.toString()
                    // );

                    community.creater = new mongoose.Types.ObjectId(newCreaterId); // again creater
                    // console.log("New creater assigned:", newCreaterId);

                    await community.save();
                } else {
                    console.log("No eligible members, setting creater to null");
                    community.creater = null;
                    await community.save();
                }
            } else {
                console.log("No members left, setting creater to null");
                community.creater = null;
                await community.save();
            }
        }

        // 3. Delete the user
        await User.findByIdAndDelete(user._id);

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};




module.exports = { createUser, userInfo, pictureChange, fetchUser, updateUsername, updatePassword, deleteUser };
