const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { restaurant_id, items, payment_method } = req.body;
    const customer_id = req.user.id; // From Auth Middleware

    // Simple Total Calculation (Should verify with DB prices in production)
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.price * item.quantity;
      // Add topping prices if logic exists...
    });

    const result = await Order.create({
      customerId: customer_id,
      restaurantId: restaurant_id,
      items,
      totalAmount,
      paymentMethod: payment_method,
      address: req.body.address, // Capture address
      note: req.body.note,
    });

    res.status(201).json(result);

    // --- SIMULATION LOGIC ---
    const io = req.app.get("socketio");
    const orderId = result.order_id;
    const room = `order_${orderId}`;

    console.log(`Starting simulation for Order #${orderId}`);

    // Helper to update status and emit
    const updateStatus = async (status, delay) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          // In a real app, you'd update DB here
          // await Order.updateStatus(orderId, status);

          io.to(room).emit("order_status_update", {
            order_id: orderId,
            status: status,
            timestamp: new Date(),
          });
          console.log(`[SIM] Order #${orderId} -> ${status}`);
          resolve();
        }, delay);
      });
    };

    // Helper to simulate driver movement
    const simulateDriver = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) {
          clearInterval(interval);
          return;
        }

        // Simple linear interpolation from Store to Customer (Mock coords)
        // Store: 10.762622, 106.660172
        // Customer: 10.776000, 106.701000
        const lat = 10.762622 + (10.776 - 10.762622) * (progress / 100);
        const lng = 106.660172 + (106.701 - 106.660172) * (progress / 100);

        io.to(room).emit("driver_location", {
          lat,
          lng,
          bearing: 45, // Mock bearing
        });
      }, 2000); // Update every 2s
    };

    // Simulation Sequence (Async, fire and forget from response perspective)
    (async () => {
      await updateStatus("CONFIRMED", 2000);
      await updateStatus("PREPARING", 5000);
      await updateStatus("READY", 5000);

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
      await updateStatus("COMPLETED", 20000); // Arrive after 20s
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

    // Security check: Only owner can view
    // Convert both to numbers for comparison
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
    const customerId = req.user.id; // JWT stores id, not user_id
    // JOIN with Restaurants to get shop name and image
    const query = `
      SELECT o.order_id, o.total_amount, o.status, o.created_at,
             r.shop_name, r.image_url, r.restaurant_id,
             (SELECT COUNT(*) FROM OrderDetails od WHERE od.order_id = o.order_id) as item_count
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    // Note: Ideally use OrderModel, but direct query is faster for this specific view model
    const { rows } = await require("../config/db").query(query, [customerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
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

module.exports = {
  createOrder,
  getOrder,
  getOrderHistory,
  getActiveOrderCount,
};
