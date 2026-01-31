const { Client } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function quickCheck() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();

    // Check total orders
    const total = await client.query("SELECT COUNT(*) FROM Orders");
    console.log(`\n📊 Total orders in DB: ${total.rows[0].count}`);

    if (total.rows[0].count > 0) {
      // Show all orders with customer info
      const orders = await client.query(`
        SELECT o.order_id, o.customer_id, u.email, u.full_name, o.status, o.created_at
        FROM Orders o
        LEFT JOIN Users u ON o.customer_id = u.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      console.log("\n📋 Recent orders:");
      console.table(orders.rows);

      // Test LEFT JOIN query
      const testQuery = await client.query(`
        SELECT o.order_id, o.customer_id, o.total_amount, o.status,
               COALESCE(r.shop_name, 'Missing Restaurant') as shop_name
        FROM Orders o
        LEFT JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
        LIMIT 5
      `);
      console.log("\n🔍 Test LEFT JOIN:");
      console.table(testQuery.rows);
    } else {
      console.log("❌ No orders found in database!");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

quickCheck();
