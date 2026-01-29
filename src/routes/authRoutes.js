const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const auth = require("../middlewares/auth");
const User = require("../models/userModel");

// @route   POST api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", register);

// @route   POST api/v1/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET api/v1/auth/me
// @desc    Get current user info
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
