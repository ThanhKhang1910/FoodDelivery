const express = require("express");
const router = express.Router();
const {
  addFoodItem,
  getOrders,
  updateStatus,
} = require("../controllers/restaurantPortalController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// @route   POST api/v1/partner/foods
// @desc    Add new food item
router.post("/foods", addFoodItem);

// @route   GET api/v1/partner/orders
// @desc    Get pending orders
router.get("/orders", getOrders);

// @route   PUT api/v1/partner/orders/:orderId/status
// @desc    Confirm/Update order
router.put("/orders/:orderId/status", updateStatus);

module.exports = router;
