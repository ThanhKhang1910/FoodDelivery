const db = require("../config/db");

// Helper to add missing columns
async function ensureColumnsExist(client) {
  try {
    await client.query(`
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10, 8);
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11, 8);
    `);
    console.log(
      "[OrderModel] Schema updated: Added latitude/longitude columns.",
    );
  } catch (err) {
    console.error("[OrderModel] Failed to update schema:", err);
  }
}

class Order {
  static async create({
    customer_id,
    restaurantId,
    items,
    totalAmount,
    paymentMethod,
    address,
    customer_latitude,
    customer_longitude,
    note,
    service_type = "FOOD",
    pickup_address = null,
    pickup_latitude = null,
    pickup_longitude = null,
  }) {
    const client = await db.pool.connect();

    // Define the insert logic as a reusable function
    const executeInsert = async () => {
      // 1. Create Order
      const orderQuery = `
        INSERT INTO Orders (
            customer_id, restaurant_id, total_amount, final_amount, 
            payment_method, status, address, customer_latitude, customer_longitude, 
            note, service_type, pickup_address, pickup_latitude, pickup_longitude
        )
        VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING order_id, created_at;
      `;
      const orderValues = [
        customer_id,
        restaurantId,
        totalAmount,
        totalAmount,
        paymentMethod,
        address,
        customer_latitude,
        customer_longitude,
        note,
        service_type,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      return orderResult.rows[0];
    };

    try {
      await client.query("BEGIN");

      let orderRow;
      try {
        orderRow = await executeInsert();
      } catch (insertError) {
        // Self-healing: If column missing, add it and retry
        if (
          insertError.code === "42703" &&
          insertError.message.includes("customer_latitude")
        ) {
          console.warn(
            "[OrderModel] Missing columns detected. Attempting auto-migration...",
          );
          await client.query("ROLLBACK"); // Must rollback current transaction before altering schema
          await ensureColumnsExist(client);

          await client.query("BEGIN"); // Restart transaction
          orderRow = await executeInsert(); // Retry insert
        } else {
          throw insertError; // Re-throw other errors
        }
      }

      const orderId = orderRow.order_id;
      const createdAt = orderRow.created_at;

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
      return {
        order_id: orderId,
        status: "PENDING",
        created_at: createdAt,
      };
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("[OrderModel] Create Error:", e.message);
      throw e;
    } finally {
      client.release();
    }
  }

  static async findById(orderId) {
    const query = `
      SELECT o.*, 
             r.shop_name, 
             r.latitude as restaurant_lat,
             r.longitude as restaurant_lng,
             d.vehicle_plate AS driver_plate,
             d.driver_id
      FROM Orders o
      LEFT JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN Drivers d ON o.driver_id = d.driver_id
      WHERE o.order_id = $1
    `;
    const { rows } = await db.query(query, [orderId]);
    if (rows[0]) {
      // Ensure coordinates are numbers (Postgres returns decimal as string)
      if (rows[0].customer_latitude)
        rows[0].customer_latitude = parseFloat(rows[0].customer_latitude);
      if (rows[0].customer_longitude)
        rows[0].customer_longitude = parseFloat(rows[0].customer_longitude);
      if (rows[0].restaurant_lat)
        rows[0].restaurant_lat = parseFloat(rows[0].restaurant_lat);
      if (rows[0].restaurant_lng)
        rows[0].restaurant_lng = parseFloat(rows[0].restaurant_lng);
        
      // Bike Pickup Coords
      if (rows[0].pickup_latitude)
        rows[0].pickup_latitude = parseFloat(rows[0].pickup_latitude);
      if (rows[0].pickup_longitude)
        rows[0].pickup_longitude = parseFloat(rows[0].pickup_longitude);

      // Fetch Items
      const itemsQuery = `
        SELECT od.food_id, od.quantity, od.price, f.name, f.image_url 
        FROM OrderDetails od 
        JOIN Foods f ON od.food_id = f.food_id 
        WHERE od.order_id = $1
      `;
      const itemsRes = await db.query(itemsQuery, [orderId]);
      rows[0].items = itemsRes.rows;
    }
    return rows[0];
  }
}

module.exports = Order;
