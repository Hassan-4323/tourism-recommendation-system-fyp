const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { protect } = require("../middleware/authMiddleware");
const { sendOtpEmail } = require("../utils/mailer");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/send-verification-code", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        code: otpCode,
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otpCode);

    return res.json({
      message: "Verification code sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Send verification code error:", error.message);
    return res.status(500).json({
      message:
        error.message ||
        "Unable to send verification code right now. Please check mail settings.",
    });
  }
});

router.post("/verify-email-code", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();

    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: "No verification code found for this email" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (otpRecord.code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email code error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const role = req.body.role === "admin" ? "admin" : "user";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const verifiedOtp = await Otp.findOne({ email, verified: true });
    if (!verifiedOtp) {
      return res.status(400).json({ message: "Please verify your email before creating the account" });
    }

    if (verifiedOtp.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: verifiedOtp._id });
      return res.status(400).json({ message: "Email verification expired. Please verify again." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await Otp.deleteOne({ email });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
