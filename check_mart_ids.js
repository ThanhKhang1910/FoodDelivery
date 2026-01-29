const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bronauto",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function checkMartIDs() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT restaurant_id, shop_name, 
        CASE 
          WHEN restaurant_id >= 2001 AND restaurant_id <= 2006 THEN '🏪 MART'
          ELSE '🍴 FOOD'
        END as type
      FROM Restaurants
      ORDER BY restaurant_id
    `);

    console.log("\n📊 All Restaurants in Database:\n");
    result.rows.forEach((r) => {
      console.log(`${r.type} | ID: ${r.restaurant_id} | ${r.shop_name}`);
    });

    const marts = result.rows.filter(
      (r) => r.restaurant_id >= 2001 && r.restaurant_id <= 2006,
    );
    const foods = result.rows.filter(
      (r) => r.restaurant_id < 2001 || r.restaurant_id > 2006,
    );

    console.log(`\n✅ Summary:`);
    console.log(`   FOOD: ${foods.length} restaurants`);
    console.log(`   MART: ${marts.length} stores`);

    if (marts.length === 0) {
      console.log("\n⚠️  WARNING: No mart stores found with ID 2001-2006!");
      console.log("   You need to run: node add_real_mart_stores.js");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMartIDs();
