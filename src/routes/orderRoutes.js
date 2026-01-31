const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// @route   POST api/v1/customer/orders
// @desc    Place a new order
// @access  Private (Customer)
router.post("/create", protect, orderController.createOrder);

// @route   GET api/v1/customer/orders/history
// @desc    Get recent order history
// @access  Private
router.get("/history", protect, orderController.getOrderHistory);

// @route   GET api/v1/customer/orders/:id
// @desc    Get order details
// @access  Private (Customer)
router.get("/:id", protect, orderController.getOrder);

// @route   POST api/v1/customer/orders/:id/complete
// @desc    Manually complete an order (triggered by frontend animation)
// @access  Private
router.post("/:id/complete", protect, orderController.completeOrder);

// @route   POST api/v1/customer/orders/fee
// @desc    Calculate shipping fee based on distance
// @access  Private
router.post("/fee", protect, orderController.calculateFee);

module.exports = router;
