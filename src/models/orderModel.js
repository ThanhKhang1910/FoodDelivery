const db = require("../config/db");

class Order {
  static async create({
    customer_id,
    restaurantId,
    items,
    totalAmount,
    paymentMethod,
    address,
    note,
  }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Create Order
      const orderQuery = `
        INSERT INTO Orders (customer_id, restaurant_id, total_amount, final_amount, payment_method, status, address, note)
        VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7)
        RETURNING order_id, created_at;
      `;
      // Note: Assuming final_amount = total_amount for now (no vouchers yet)
      const orderValues = [
        customer_id, // Match the arg name in destructuring above
        restaurantId,
        totalAmount,
        totalAmount,
        paymentMethod,
        address,
        note,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const orderId = orderResult.rows[0].order_id;

      // 2. Create Order Details & Toppings
      for (const item of items) {
        const detailQuery = `
            INSERT INTO OrderDetails (order_id, food_id, quantity, price)
            VALUES ($1, $2, $3, $4)
            RETURNING order_detail_id;
        `;
        const detailValues = [orderId, item.food_id, item.quantity, item.price];
        const detailResult = await client.query(detailQuery, detailValues);

        // Handle Toppings (If any)
        if (item.toppings && item.toppings.length > 0) {
          const detailId = detailResult.rows[0].order_detail_id;
          for (const toppingId of item.toppings) {
            await client.query(
              "INSERT INTO OrderDetailToppings (order_detail_id, topping_id) VALUES ($1, $2)",
              [detailId, toppingId],
            );
          }
        }
      }

      await client.query("COMMIT");
      return { order_id: orderId, status: "PENDING" };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  static async findById(orderId) {
    const query = `
      SELECT o.*, 
             r.shop_name, 
             d.vehicle_plate AS driver_plate,
             d.driver_id
      FROM Orders o
      JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN Drivers d ON o.driver_id = d.driver_id
      WHERE o.order_id = $1
    `;
    const { rows } = await db.query(query, [orderId]);
    return rows[0];
  }
}

module.exports = Order;
