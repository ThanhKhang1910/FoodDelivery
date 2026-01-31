const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bronauto",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function checkRestaurants() {
  const client = await pool.connect();

  try {
    console.log("Checking all restaurants in database...\n");

    const result = await client.query(`
      SELECT restaurant_id, shop_name, address, rating, is_open
      FROM Restaurants
      ORDER BY restaurant_id
    `);

    console.log(`Total restaurants: ${result.rows.length}\n`);

    console.log("=== RESTAURANTS ===");
    result.rows.forEach((r) => {
      const type =
        r.restaurant_id >= 2001 && r.restaurant_id <= 2006
          ? "🏪 MART"
          : "🍴 FOOD";
      console.log(
        `${type} | ID: ${r.restaurant_id} | ${r.shop_name} | Rating: ${r.rating}`,
      );
    });

    const marts = result.rows.filter(
      (r) => r.restaurant_id >= 2001 && r.restaurant_id <= 2006,
    );
    const foods = result.rows.filter(
      (r) => r.restaurant_id < 2001 || r.restaurant_id > 2006,
    );

    console.log(`\n📊 Summary:`);
    console.log(`   FOOD restaurants: ${foods.length}`);
    console.log(`   MART stores: ${marts.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRestaurants();
