const db = require("../config/db");

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const query = `
      SELECT r.* 
      FROM Restaurants r
      JOIN user_favorites uf ON r.restaurant_id = uf.restaurant_id
      WHERE uf.user_id = $1
      ORDER BY uf.created_at DESC
    `;
    const { rows } = await db.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleFavorite = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const userId = req.user.user_id;
    const { restaurantId } = req.body;

    // Check if exists
    const checkQuery =
      "SELECT * FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2";
    const checkResult = await client.query(checkQuery, [userId, restaurantId]);

    if (checkResult.rows.length > 0) {
      // Remove
      await client.query(
        "DELETE FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2",
        [userId, restaurantId],
      );
      res.json({ message: "Removed from favorites", isFavorite: false });
    } else {
      // Add
      await client.query(
        "INSERT INTO user_favorites (user_id, restaurant_id) VALUES ($1, $2)",
        [userId, restaurantId],
      );
      res.json({ message: "Added to favorites", isFavorite: true });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

exports.checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    // Return list of favorite restaurant IDs for easy frontend checking
    const query = "SELECT restaurant_id FROM user_favorites WHERE user_id = $1";
    const { rows } = await db.query(query, [userId]);
    const ids = rows.map((row) => row.restaurant_id);
    res.json(ids);
  } catch (error) {
    console.error("Error checking favorite status", error);
    res.status(500).send("Server Error");
  }
};
