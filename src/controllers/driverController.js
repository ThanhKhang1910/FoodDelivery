const Driver = require("../models/driverModel");

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driverId = req.user.id;

    const updatedDriver = await Driver.updateLocation(driverId, lat, lng);

    // Convert Global IO to find the socket?
    // Usually we emit to a "customer_room" if the driver is assigned.
    // implementation pending socket integration structure.

    res.json({ message: "Location updated", data: updatedDriver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const goOnline = async (req, res) => {
  try {
    const { isOnline } = req.body; // true/false
    const driverId = req.user.id;
    const result = await Driver.toggleStatus(driverId, isOnline);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const driverId = req.user.id;

    const result = await Driver.acceptOrder(driverId, orderId);
    res.json({ message: "Order Accepted", order: result });
  } catch (err) {
    console.error(err);
    if (err.message === "Order already taken") {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const getAvailableOrders = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    // Mocked implementation for now
    const orders = await Driver.getIncomingOrders(lat, lng);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  updateLocation,
  goOnline,
  acceptOrder,
  getAvailableOrders,
};
