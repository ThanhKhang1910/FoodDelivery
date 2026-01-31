const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

async function addRestaurantCoords() {
  const client = await pool.connect();
  try {
    console.log("🔌 Connected to database...");

    // 1. Add Columns
    console.log("🛠️ Adding columns latitude/longitude to Restaurants...");
    await client.query(`
      ALTER TABLE Restaurants ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
      ALTER TABLE Restaurants ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    `);
    console.log("✅ Columns added.");

    // 2. Update Existing Restaurants (Mock Coordinates in HCMC)
    // Restaurant 1: Phở Hòa (Quận 3) -> Real coords: 10.7891, 106.6874
    // Restaurant 2: Cơm Tấm Cali (Quận 1) -> Real coords: 10.7721, 106.6983
    // Restaurant 3: Gong Cha (Quận 5) -> Real coords: 10.7554, 106.6669
    // Restaurant 4: Pizza 4P's (Quận 1) -> Real coords: 10.7778, 106.7011
    // Restaurant 5: Phúc Long (Quận 10) -> Real coords: 10.7716, 106.6696

    console.log("📍 Updating restaurant locations...");

    await client.query(
      `UPDATE Restaurants SET latitude = 10.7891, longitude = 106.6874 WHERE restaurant_id = 1;`,
    );
    await client.query(
      `UPDATE Restaurants SET latitude = 10.7721, longitude = 106.6983 WHERE restaurant_id = 2;`,
    );
    await client.query(
      `UPDATE Restaurants SET latitude = 10.7554, longitude = 106.6669 WHERE restaurant_id = 3;`,
    );
    await client.query(
      `UPDATE Restaurants SET latitude = 10.7778, longitude = 106.7011 WHERE restaurant_id = 4;`,
    );
    await client.query(
      `UPDATE Restaurants SET latitude = 10.7716, longitude = 106.6696 WHERE restaurant_id = 5;`,
    );
    await client.query(
      `UPDATE Restaurants SET latitude = 10.7626, longitude = 106.6601 WHERE latitude IS NULL;`,
    ); // Default fallback

    console.log("🎉 Restaurants locations updated!");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

addRestaurantCoords();
