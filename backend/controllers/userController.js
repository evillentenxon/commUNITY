const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { findById } = require("../models/communityModel");

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


module.exports = { createUser, userInfo, pictureChange };
