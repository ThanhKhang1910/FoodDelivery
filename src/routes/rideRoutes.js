const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
// const { auth } = require("../middleware/auth"); // Assuming middleware exists or handled differently

router.post("/", rideController.requestRide);
router.get("/nearby", rideController.getNearbyDrivers);
router.get("/:id", rideController.getStatus);

module.exports = router;
