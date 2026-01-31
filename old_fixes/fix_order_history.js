const { Client } = require("pg");
require("dotenv").config();

async function fixOrderHistory() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log("Connected to DB.");

    // 1. Check Columns
    console.log("Checking Orders table schema...");
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    const columns = res.rows.map((r) => r.column_name);
    console.log("Existing columns:", columns);

    const missingCols = [];
    if (!columns.includes("address")) missingCols.push("address TEXT");
    if (!columns.includes("note")) missingCols.push("note TEXT");
    if (!columns.includes("payment_method"))
      missingCols.push("payment_method VARCHAR(50)");

    if (missingCols.length > 0) {
      console.log(`Adding missing columns: ${missingCols.join(", ")}`);
      for (const col of missingCols) {
        await client.query(
          `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS ${col};`,
        );
      }
      console.log("Columns added successfully.");
    } else {
      console.log("All required columns exist.");
    }

    // 2. Check Data
    const orders = await client.query(
      "SELECT order_id, status FROM Orders LIMIT 5",
    );
    console.log("Recent Orders:", orders.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

fixOrderHistory();
