const Order = require("../models/orderModel");
const { calculateDistance } = require("../utils/distanceUtils");

// Pricing Logic (Food/Mart)
// Pricing Logic
const calculateShipping = (distanceKm, serviceType = "FOOD") => {
  if (serviceType === "BIKE") {
    // 0 - 2 km: 12k
    // 2 - 9 km: +4k/km
    // > 9 km: +3k/km
    if (distanceKm <= 2) return 12000;
    if (distanceKm <= 9) {
      return 12000 + Math.ceil(distanceKm - 2) * 4000;
    }
    return 12000 + 28000 + Math.ceil(distanceKm - 9) * 3000; // 12k + 7*4k
  }

  // FOOD/MART Logic
  const BASE_FEE = 10000;
  const BASE_DISTANCE = 4; // km
  const EXTRA_RATE = 5000; // per km

  if (distanceKm <= BASE_DISTANCE) {
    return BASE_FEE;
  }
  const extraKm = Math.ceil(distanceKm - BASE_DISTANCE);
  return BASE_FEE + extraKm * EXTRA_RATE;
};

const createOrder = async (req, res) => {
  try {
    const {
      restaurant_id,
      items = [],
      payment_method,
      service_type = "FOOD",
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      customer_latitude,
      customer_longitude,
    } = req.body;
    const customer_id = req.user.id; // From Auth Middleware

    // --- DYNAMIC SHIPPING FEE CALCULATION ---
    let shippingFee = 0;
    let distance = 0;

    if (service_type === "BIKE") {
      // BIKE LOGIC
      if (
        !pickup_latitude ||
        !pickup_longitude ||
        !customer_latitude ||
        !customer_longitude
      ) {
        return res
          .status(400)
          .json({ message: "Missing pickup/dropoff coordinates" });
      }

      const start = { lat: pickup_latitude, lng: pickup_longitude };
      const end = { lat: customer_latitude, lng: customer_longitude };

      distance = await calculateDistance(start, end);
      shippingFee = calculateShipping(distance, "BIKE");
      console.log(
        `[CreateOrder-BIKE] Distance: ${distance}km -> Fee: ${shippingFee}`,
      );

      // No restaurant validation for Bike
    } else {
      // FOOD LOGIC
      // Fetch Restaurant Coords
      const Restaurant = require("../models/restaurantModel");
      const restaurant = await Restaurant.findById(restaurant_id);

      if (
        restaurant &&
        req.body.customer_latitude &&
        req.body.customer_longitude
      ) {
        const start = { lat: restaurant.latitude, lng: restaurant.longitude };
        const end = {
          lat: req.body.customer_latitude,
          lng: req.body.customer_longitude,
        };

        distance = await calculateDistance(start, end);
        shippingFee = calculateShipping(distance, "FOOD");
        console.log(
          `[CreateOrder-FOOD] Distance: ${distance}km -> Fee: ${shippingFee}`,
        );
      } else {
        shippingFee = 15000; // Fallback
      }
    }

    // Recalculate Total
    let itemsTotal = 0;
    if (items && items.length > 0) {
      items.forEach((item) => {
        itemsTotal += item.price * item.quantity;
      });
    } else {
      // If Bike, logic might imply fee IS the total.
      // Or we should add a dummy item?
      // Current logic: totalAmount = itemsTotal + shippingFee - discount
      // If itemsTotal is 0, totalAmount = shippingFee. Correct.
    }

    // Check discount
    const discount = req.body.discount || 0;

    // Final Total
    totalAmount = itemsTotal + shippingFee - discount;

    const result = await Order.create({
      customer_id: customer_id,
      restaurantId: restaurant_id || null, // Allow null for Bike
      items,
      totalAmount,
      paymentMethod: payment_method,
      address: req.body.address,
      customer_latitude: req.body.customer_latitude || null,
      customer_longitude: req.body.customer_longitude || null,
      note: req.body.note,
      service_type: service_type,
      pickup_address: pickup_address || null,
      pickup_latitude: pickup_latitude || null,
      pickup_longitude: pickup_longitude || null,
    });

    res.status(201).json({ ...result, shipping_fee: shippingFee, distance });

    // --- SIMULATION LOGIC ---
    const io = req.app.get("socketio");
    const orderId = result.order_id;
    const room = `order_${orderId}`;

    console.log(`Starting simulation for Order #${orderId}`);

    // Helper to update status and emit
    const updateStatus = async (status, delay) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            // Update DATABASE
            const db = require("../config/db");
            const result = await db.pool.query(
              "UPDATE Orders SET status = $1 WHERE order_id = $2 RETURNING status",
              [status, orderId],
            );

            if (result.rowCount > 0) {
              console.log(
                `[SIM] Order #${orderId} -> ${status} (DB Updated ✅)`,
              );
            } else {
              console.log(
                `[SIM] Order #${orderId} -> ${status} (DB Update FAILED - No rows affected)`,
              );
            }

            // Emit to specific order room (for tracking page)
            io.to(room).emit("order_status_update", {
              order_id: orderId,
              status: status,
              timestamp: new Date(),
            });

            // Emit to user-specific room (for order history page)
            io.to(`user_${customer_id}`).emit("order_status_update", {
              order_id: orderId,
              status: status,
              timestamp: new Date(),
            });
          } catch (error) {
            console.error(
              `[SIM] Failed to update Order #${orderId} to ${status}:`,
              error.message,
            );
          }

          resolve();
        }, delay);
      });
    };
    const simulateDriver = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
          return;
        }
        const lat = 10.762622 + (10.776 - 10.762622) * (progress / 100);
        const lng = 106.660172 + (106.701 - 106.660172) * (progress / 100);

        io.to(room).emit("driver_location", {
          lat,
          lng,
          bearing: 45,
        });
      }, 2000);
    };

    (async () => {
      await updateStatus("CONFIRMED", 2000);
      await updateStatus("PREPARING", 5000);

      io.to(room).emit("driver_assigned", {
        driver: {
          name: "Nguyễn Văn A",
          plate: "59-S1 123.45",
          phone: "0901234567",
          rating: 4.9,
        },
      });

      await updateStatus("DELIVERING", 2000);
      simulateDriver();
    })();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (parseInt(order.customer_id) !== parseInt(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const customerId = req.user.id;
    console.log(
      `[OrderHistory] Fetching orders for customer ID: ${customerId}`,
    );

    const query = `
      SELECT o.order_id, o.total_amount, o.status, o.created_at, 
             o.address, o.note,
             COALESCE(r.shop_name, 'Nhà hàng không tồn tại') as shop_name, 
             COALESCE(r.image_url, '/placeholder.png') as image_url, 
             r.restaurant_id,
             (SELECT COUNT(*) FROM OrderDetails od WHERE od.order_id = o.order_id) as item_count
      FROM Orders o
      LEFT JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    const { rows } = await require("../config/db").query(query, [customerId]);
    console.log(`[OrderHistory] Found ${rows.length} orders`);
    if (rows.length > 0) {
      console.log("[OrderHistory] Sample order:", rows[0]);
    }
    res.json(rows);
  } catch (err) {
    console.error("[OrderHistory] Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
const getActiveOrderCount = async (req, res) => {
  try {
    const customerId = req.user.id;
    const query = `
      SELECT COUNT(*) as active_count
      FROM Orders
      WHERE customer_id = $1 
      AND status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING')
    `;
    const { rows } = await require("../config/db").query(query, [customerId]);
    res.json({ count: parseInt(rows[0].active_count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const debugOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[CompleteOrder] Completing order #${id}`);

    // 1. Update Status in DB
    const db = require("../config/db");
    await db.pool.query(
      "UPDATE Orders SET status = 'COMPLETED' WHERE order_id = $1",
      [id],
    );

    // 2. Fetch Order Details for Email
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 3. Emit Socket Event
    const io = req.app.get("socketio");
    if (io) {
      io.to(`order_${id}`).emit("order_status_update", {
        order_id: id,
        status: "COMPLETED",
        timestamp: new Date(),
      });
      // Also notify user room
      if (order.customer_id) {
        io.to(`user_${order.customer_id}`).emit("order_status_update", {
          order_id: id,
          status: "COMPLETED",
          timestamp: new Date(),
        });
      }
    }

    res.json({ success: true, message: "Order completed" });

    // 4. Send Email (Async)
    (async () => {
      try {
        // Fetch User Data
        const userRes = await db.pool.query(
          "SELECT email, full_name FROM Users WHERE user_id = $1",
          [order.customer_id],
        );
        const user = userRes.rows[0];

        // Fetch Restaurant Data
        const Restaurant = require("../models/restaurantModel");
        const restaurant = await Restaurant.findById(order.restaurant_id);

        if (user && restaurant) {
          const emailService = require("../services/emailService");

          // Reconstruct Items format for email template
          // order.items has { name, price, quantity, ... } from Order.findById join
          const emailItems = order.items.map((i) => ({
            item_name: i.name,
            price: i.price,
            quantity: i.quantity,
          }));

          // Calculate logic
          const subtotal = emailItems.reduce(
            (acc, i) => acc + i.price * i.quantity,
            0,
          );
          const shippingFee = 15000; // Fixed for now
          const discount = 0; // Not stored in DB? Assuming 0 or need to store in Order table.
          // Model 'Order' creation didn't seem to persist discount in 'Orders' table?
          // Checked createOrder: "totalAmount" is stored.
          // let's use order.total_amount from DB.

          await emailService.sendOrderCompletedEmail({
            email: user.email,
            customerName: user.full_name,
            orderId: id,
            restaurantName: restaurant.shop_name,
            restaurantAddress: restaurant.address,
            customerAddress: order.address,
            items: emailItems,
            subtotal: subtotal,
            shippingFee: shippingFee,
            discount: discount,
            total: order.total_amount,
            orderTime: order.created_at,
          });
        }
      } catch (emailErr) {
        console.error("Failed to send email in completeOrder:", emailErr);
      }
    })();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const calculateFee = async (req, res) => {
  try {
    const {
      restaurant_id,
      latitude,
      longitude,
      service_type,
      pickup_latitude,
      pickup_longitude,
    } = req.body;

    let distance = 0;
    let fee = 0;

    if (service_type === "BIKE") {
      if (!pickup_latitude || !pickup_longitude || !latitude || !longitude) {
        return res
          .status(400)
          .json({ message: "Missing coordinates for Bike" });
      }
      const start = { lat: pickup_latitude, lng: pickup_longitude };
      const end = { lat: latitude, lng: longitude };
      distance = await calculateDistance(start, end);
      fee = calculateShipping(distance, "BIKE");
    } else {
      // Food Logic
      if (!latitude || !longitude || !restaurant_id) {
        return res
          .status(400)
          .json({ message: "Missing info for Food delivery" });
      }

      const Restaurant = require("../models/restaurantModel");
      const restaurant = await Restaurant.findById(restaurant_id);

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const start = { lat: restaurant.latitude, lng: restaurant.longitude };
      const end = { lat: latitude, lng: longitude };

      distance = await calculateDistance(start, end);
      fee = calculateShipping(distance, "FOOD");
    }

    res.json({
      distance_km: distance,
      shipping_fee: fee,
      formatted_fee: fee.toLocaleString() + "đ",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getOrderHistory,
  getActiveOrderCount,
  getActiveOrderCount,
  debugOrder,
  completeOrder,
  calculateFee,
};
