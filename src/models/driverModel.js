const db = require("../config/db");

class Driver {
  static async updateLocation(driverId, lat, lng) {
    const query = `
      UPDATE Drivers 
      SET current_lat = $1, current_long = $2, is_online = true 
      WHERE driver_id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [lat, lng, driverId]);
    return rows[0];
  }

  static async toggleStatus(driverId, isOnline) {
    const query = `
      UPDATE Drivers 
      SET is_online = $1 
      WHERE driver_id = $2
      RETURNING is_online;
    `;
    const { rows } = await db.query(query, [isOnline, driverId]);
    return rows[0];
  }

  static async acceptOrder(driverId, orderId) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Check if order is available (PENDING or CONFIRMED and no driver assigned)
      const checkQuery = `
        SELECT status, driver_id FROM Orders 
        WHERE order_id = $1 FOR UPDATE
      `;
      const checkResult = await client.query(checkQuery, [orderId]);
      const order = checkResult.rows[0];

      if (!order) throw new Error("Order not found");
      if (order.driver_id) throw new Error("Order already taken");
      // Allow accepting if status is CONFIRMED (Restaurant accepted) or even PENDING (Auto-assign logic varies)
      // Usually, Driver accepts after Restaurant confirms.

      // 2. Assign Driver
      const updateQuery = `
        UPDATE Orders 
        SET driver_id = $1, status = 'DRIVER_ASSIGNED'
        WHERE order_id = $2
        RETURNING *;
      `;
      const { rows } = await client.query(updateQuery, [driverId, orderId]);

      await client.query("COMMIT");
      return rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  static async getIncomingOrders(lat, lng, radiusKm = 5) {
    // Simple distance calculation (Earth sphere)
    // In production, use PostGIS: ST_DWithin(geom, ...)
    const query = `
        SELECT o.order_id, r.shop_name, r.address as shop_address, 
               o.total_amount, o.status,
               ( 6371 * acos( cos( radians($1) ) * cos( radians( r.latitude ) ) * cos( radians( r.longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( r.latitude ) ) ) ) AS distance
        FROM Orders o
        JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
        WHERE o.status = 'CONFIRMED' AND o.driver_id IS NULL
        HAVING distance < $3
        ORDER BY distance ASC
        LIMIT 10;
     `;
    // Note: "HAVING" with alias works in MySQL, for Postgres might need subquery or LATERAL JOIN.
    // Simplified for standard SQL compatibility:
    const simpleQuery = `
        SELECT o.order_id, r.shop_name, r.address as shop_address, o.total_amount, o.status
        FROM Orders o
        JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
        WHERE o.status = 'CONFIRMED' AND o.driver_id IS NULL
     `;
    const { rows } = await db.query(simpleQuery);
    return rows;
  }
}

module.exports = Driver;
