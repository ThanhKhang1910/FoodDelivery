const Ride = require("../models/rideModel");

const requestRide = async (req, res) => {
  try {
    const {
      serviceType,
      pickupAddress,
      destinationAddress,
      pickupLat,
      pickupLong,
      destLat,
      destLong,
      fare,
    } = req.body;
    const customerId = req.user?.id || 1; // Fallback for dev if auth is not blocking

    const newRide = await Ride.create({
      customerId,
      serviceType,
      pickupAddress,
      destinationAddress,
      pickupLat,
      pickupLong,
      destLat,
      destLong,
      fare,
    });

    // Strategy: Return ride info, frontend will poll or use sockets for status
    res.status(201).json({ message: "Ride requested", ride: newRide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ message: "Missing location" });

    const drivers = await Ride.findNearbyDrivers(lat, lng, type || "BIKE");
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.getRideStatus(id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Mocking driver assignment for demonstration if status is SEARCHING
    if (ride.status === "SEARCHING") {
      // After 5 seconds of real time, we might auto-assign in a background job
      // For this project, we'll let the user see 'Searching...'
    }

    res.json(ride);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  requestRide,
  getNearbyDrivers,
  getStatus,
};
