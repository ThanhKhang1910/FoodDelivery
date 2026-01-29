const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrder,
  getOrderHistory,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST api/v1/customer/orders
// @desc    Place a new order
// @access  Private (Customer)
router.post("/", protect, createOrder);

// @route   GET api/v1/customer/orders/history
// @desc    Get recent order history
// @access  Private
router.get("/history", protect, getOrderHistory);

// @route   GET api/v1/customer/orders/:id
// @desc    Get order details
// @access  Private (Customer)
router.get("/:id", protect, getOrder);

module.exports = router;
