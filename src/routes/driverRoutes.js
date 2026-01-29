const express = require("express");
const router = express.Router();
const {
  updateLocation,
  goOnline,
  acceptOrder,
  getAvailableOrders,
} = require("../controllers/driverController");
const { protect } = require("../middleware/authMiddleware");

// All routes require login
router.use(protect);

// @route   PUT api/v1/driver/location
// @desc    Update realtime location
router.put("/location", updateLocation);

// @route   PUT api/v1/driver/status
// @desc    Toggle Online/Offline
router.put("/status", goOnline);

// @route   GET api/v1/driver/orders
// @desc    Get nearby available orders
router.get("/orders", getAvailableOrders);

// @route   POST api/v1/driver/orders/accept
// @desc    Accept an order
router.post("/orders/accept", acceptOrder);

module.exports = router;
