const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

async function fixDatabase() {
  const client = await pool.connect();
  try {
    console.log("🔌 Connected to database...");

    // Check if columns exist
    const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('customer_latitude', 'customer_longitude');
    `;

    const checkRes = await client.query(checkQuery);
    console.log(
      "📊 Current columns found:",
      checkRes.rows.map((r) => r.column_name),
    );

    // Add columns if missing
    console.log("🛠️ Adding columns if missing...");

    await client.query(`
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10, 8);
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11, 8);
    `);

    console.log("✅ ALTER TABLE executed successfully.");

    // Verify again
    const verifyRes = await client.query(checkQuery);
    console.log(
      "📊 Columns after update:",
      verifyRes.rows.map((r) => r.column_name),
    );

    if (verifyRes.rows.length === 2) {
      console.log("🎉 SUCCESS: DB is ready for maps!");
    } else {
      console.error("❌ ERROR: Columns still missing!");
    }
  } catch (err) {
    console.error("❌ Database connection error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

fixDatabase();
