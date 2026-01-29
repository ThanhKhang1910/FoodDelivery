const RestaurantPortal = require("../models/restaurantPortalModel");

const addFoodItem = async (req, res) => {
  try {
    const { categoryId, name, price, description, imageUrl, tags } = req.body;
    const restaurantId = req.user.id; // User ID is Restaurant ID (from auth)

    // Validate role
    if (req.user.role !== "RESTAURANT")
      return res.status(403).json({ message: "Access Denied" });

    const newFood = await RestaurantPortal.createFood({
      restaurantId,
      categoryId,
      name,
      price,
      description,
      imageUrl,
      tags,
    });
    res.status(201).json(newFood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOrders = async (req, res) => {
  try {
    if (req.user.role !== "RESTAURANT")
      return res.status(403).json({ message: "Access Denied" });
    const restaurantId = req.user.id;
    const orders = await RestaurantPortal.getIncomingOrders(restaurantId);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "RESTAURANT")
      return res.status(403).json({ message: "Access Denied" });

    const { orderId } = req.params;
    const { status } = req.body; // e.g. "CONFIRMED"
    const restaurantId = req.user.id;

    const updatedOrder = await RestaurantPortal.updateOrderStatus(
      restaurantId,
      orderId,
      status,
    );

    if (!updatedOrder)
      return res
        .status(404)
        .json({ message: "Order not found or access denied" });

    // TODO: Emit socket to Customer (Order Accepted) & Driver (New Order Available)

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  addFoodItem,
  getOrders,
  updateStatus,
};
