const db = require("../config/db");

class RestaurantPortal {
  static async createFood({
    restaurantId,
    categoryId,
    name,
    price,
    description,
    imageUrl,
    tags,
  }) {
    const query = `
      INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, tags, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *;
    `;
    const values = [
      restaurantId,
      categoryId,
      name,
      price,
      description,
      imageUrl,
      JSON.stringify(tags),
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getIncomingOrders(restaurantId) {
    const query = `
      SELECT * FROM Orders 
      WHERE restaurant_id = $1 AND status = 'PENDING'
      ORDER BY created_at DESC;
    `;
    const { rows } = await db.query(query, [restaurantId]);
    return rows;
  }

  static async updateOrderStatus(restaurantId, orderId, status) {
    // Only allow valid transitions (Example: PENDING -> CONFIRMED -> PREPARING -> READY)
    const validStatuses = ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid Status Transition");
    }

    const query = `
      UPDATE Orders 
      SET status = $1 
      WHERE order_id = $2 AND restaurant_id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [status, orderId, restaurantId]);
    return rows[0];
  }
}

module.exports = RestaurantPortal;
