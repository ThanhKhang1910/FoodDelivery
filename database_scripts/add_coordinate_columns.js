const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function addCoordinateColumns() {
  const client = await pool.connect();
  try {
    console.log("Adding coordinate columns to Orders table...");

    await client.query(`
      ALTER TABLE Orders 
      ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11, 8);
    `);

    console.log("✅ Successfully added coordinate columns!");

    // Verify
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('customer_latitude', 'customer_longitude');
    `);

    console.log("\nVerification:");
    result.rows.forEach((row) => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addCoordinateColumns();
