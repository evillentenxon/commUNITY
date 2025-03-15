const transporter = require('../config/emailConfig');
const otpStore = {}; // Store OTPs temporarily
const bcrypt = require('bcrypt');
const User = require("../models/userModel");

const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json({ exists: true, message: "Email already exists" });
        }
        else if (!existingUser) {
            return res.status(200).json({ exists: false, message: "email is available" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const sentOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Function to generate a 6-digit OTP
        const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in memory (temporary storage)
        otpStore[email] = otp;

        // Email configuration
        const mailOptions = {
            from: 'romangautam71399@gmail.com',
            to: email,
            subject: "Your OTP for Verification",
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        };

        // Send email using await
        await transporter.sendMail(mailOptions);

        // Send response to frontend
        return res.status(200).json({ exists: false, otpSent: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const otpVerify = async (req, res) => {
    const { otp, email } = req.body;
    if (otpStore[email] === otp) {
        // if (testOtp === otp) {
        res.json({ message: 'OTP verified successfully' });
        delete otpStore[email];  // Optionally remove OTP after verification
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
}


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "login successful", user });
    } catch (error) {
        console.error("Login Error:", error); // Debugging

        res.status(500).json({
            message: "Login failed",
            error: error.message || error.toString(), // Ensure error is readable
        });
    }
}

module.exports = { checkEmailExists, sentOtp, otpVerify, loginUser }