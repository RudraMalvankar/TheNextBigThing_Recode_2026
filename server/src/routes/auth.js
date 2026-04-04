const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const protect = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
      token
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
      token
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

router.get("/me", protect, (req, res) => {
  const user = { id: req.user._id, name: req.user.name, email: req.user.email, plan: req.user.plan, avatar: req.user.avatar };
  res.status(200).json({ user });
});

module.exports = router;
