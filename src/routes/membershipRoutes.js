const express = require("express");
const router = express.Router();
console.log("--- Membership Routes Module Loaded ---");
const auth = require("../middlewares/auth");
const {
  createSubscription,
  checkSubscription,
  checkActiveMembership,
  approveSubscription,
  cancelSubscription,
} = require("../controllers/membershipController");

// @route   POST api/v1/membership/subscribe
// @desc    Create membership subscription
// @access  Private
router.post("/subscribe", auth, createSubscription);

// @route   GET api/v1/membership/check/:subscriptionId
// @desc    Check subscription status (for polling)
// @access  Private
router.get("/check/:subscriptionId", auth, checkSubscription);

// @route   GET api/v1/membership/active
// @desc    Check if user has active membership
// @access  Private
router.get("/active", auth, checkActiveMembership);

// @route   POST api/v1/membership/approve/:subscriptionId
// @desc    Approve subscription (admin only - for future)
// @access  Private (admin)
router.post("/approve/:subscriptionId", auth, approveSubscription);

// @route   POST api/v1/membership/cancel
// @desc    Cancel active subscription
// @access  Private
router.post("/cancel", auth, cancelSubscription);

// DEBUG WILDCARD
router.all("*", (req, res) => {
  const fs = require("fs");
  fs.writeFileSync(
    "debug_wildcard.txt",
    `Caught: ${req.method} ${req.originalUrl}\n`,
  );
  console.log(`Debug Wildcard: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Membership Wildcard Hit" });
});

module.exports = router;
