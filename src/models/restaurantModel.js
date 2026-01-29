const db = require("../config/db");

class Restaurant {
  static async findAll({
    lat,
    lng,
    search,
    category_id,
    min_rating,
    sort_by = "distance",
    limit = 20,
  }) {
    let query = `
      SELECT DISTINCT r.restaurant_id, r.shop_name, r.address, r.latitude, r.longitude, r.rating, r.is_open, r.image_url,
             (6371 * acos(cos(radians($1)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians($2)) + sin(radians($1)) * sin(radians(r.latitude)))) AS distance
      FROM Restaurants r
      LEFT JOIN Foods f ON r.restaurant_id = f.restaurant_id
      WHERE r.is_open = true
    `;

    // Params: lat, lng
    const params = [lat, lng];
    let paramIndex = 3;

    if (search) {
      query += ` AND (
        LOWER(r.shop_name) LIKE $${paramIndex} OR 
        LOWER(r.address) LIKE $${paramIndex} OR
        LOWER(f.name) LIKE $${paramIndex} OR
        LOWER(f.description) LIKE $${paramIndex}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (category_id && category_id !== "ALL") {
      // Ideally join with Categories table or check Foods category
      query += ` AND f.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (min_rating) {
      query += ` AND r.rating >= $${paramIndex}`;
      params.push(min_rating);
      paramIndex++;
    }

    // Sorting
    if (sort_by === "rating") {
      query += ` ORDER BY r.rating DESC`;
    } else if (sort_by === "name") {
      query += ` ORDER BY r.shop_name ASC`;
    } else {
      query += ` ORDER BY distance ASC`; // Default to distance
    }

    query += ` LIMIT $${paramIndex}`;
    params.push(limit);

    const { rows } = await db.query(query, params);
    return rows;
  }

  static async findById(id) {
    const query = "SELECT * FROM Restaurants WHERE restaurant_id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async getMenu(restaurantId) {
    // Get Categories first
    const catQuery = "SELECT * FROM Categories WHERE restaurant_id = $1";
    const catRows = (await db.query(catQuery, [restaurantId])).rows;

    const menu = [];

    for (const cat of catRows) {
      // Get foods for each category
      const foodQuery =
        "SELECT * FROM Foods WHERE category_id = $1 AND is_available = true";
      const foodRows = (await db.query(foodQuery, [cat.category_id])).rows;

      menu.push({
        category_id: cat.category_id,
        category_name: cat.name,
        items: foodRows,
      });
    }

    return menu;
  }
}

module.exports = Restaurant;
