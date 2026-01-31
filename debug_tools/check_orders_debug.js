const { Client } = require("pg");
require("dotenv").config();

async function debugOrders() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log("✅ Connected to DB\n");

    // 1. Check Users table
    console.log("=== USERS ===");
    const users = await client.query(
      "SELECT user_id, email, full_name FROM Users LIMIT 5",
    );
    console.table(users.rows);

    // 2. Check Orders table
    console.log("\n=== ORDERS ===");
    const orders = await client.query(`
      SELECT order_id, customer_id, restaurant_id, status, created_at, total_amount 
      FROM Orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(orders.rows);

    // 3. Check with JOIN
    console.log("\n=== ORDERS WITH JOIN (current query) ===");
    const joined = await client.query(`
      SELECT o.order_id, o.customer_id, o.status, r.shop_name, o.created_at
      FROM Orders o
      LEFT JOIN Restaurants r ON o.restaurant_id = r.restaurant_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    console.table(joined.rows);

    // 4. Check columns in Orders table
    console.log("\n=== ORDERS TABLE COLUMNS ===");
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log(columns.rows.map((r) => r.column_name).join(", "));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

debugOrders();
