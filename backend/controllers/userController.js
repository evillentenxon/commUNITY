const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const transporter = require('../config/emailConfig');
const otpStore = {}; // Store OTPs temporarily

const createUser = async (req, res) => {
    try {
        const { username, email, password, memberOf } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user instance without profilePic first
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            memberOf
        });

        // Save the user to the database
        await newUser.save();

        // Upload image to Cloudinary ONLY IF USER IS CREATED
        if (req.file) {
            console.log("Uploading profile picture...");
            newUser.profilePic = req.file.path; // Multer automatically assigns path
            await newUser.save(); // Save updated user with profilePic URL
            console.log("Profile picture uploaded successfully");
        }

        res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json({ exists: true, message: "Email already exists" });
        } else {
            return res.status(200).json({ exists: false, message: "Email is available" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// const checkEmailExists = async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({ message: "Email is required" });
//         }

//         // Check if the email exists in the database
//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(200).json({ exists: true, message: "Email already exists" });
//         }

//         // Function to generate a 6-digit OTP
//         const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

//         // If email does not exist, generate OTP
//         const otp = generateOTP();

//         // Store OTP in memory with email as key
//         otpStore[email] = otp;

//         // Send OTP via email
//         const mailOptions = {
//             from: 'romangautam71399@gmail.com',
//             to: email,
//             subject: "Your OTP for Verification",
//             text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
//         };

//         await transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error("Error sending email:", error);
//                 return res.status(500).json({ message: "Error sending email", error });
//             } else {
//                 console.log("Email sent successfully:", info.response);
//                 return res.status(200).json({ exists: false, otpSent: true, message: "OTP sent to email" });
//             }
//         });


//         return res.status(200).json({ exists: false, otpSent: true, message: "OTP sent to email" });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

const otpVerify = async (req, res) => {
    const { otp } = req.body;
    if (otpStore[email] === otp) {
        // if (testOtp === otp) {
        res.json({ message: 'OTP verified successfully' });
        delete otpStore[email];  // Optionally remove OTP after verification
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
}

module.exports = { createUser, checkEmailExists, otpVerify };
