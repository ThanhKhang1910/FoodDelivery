const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "food_delivery_db",
  password: process.env.DB_PASSWORD || "root",
  port: process.env.DB_PORT || 5432,
});

async function fixDatabase() {
  const client = await pool.connect();
  try {
    console.log("🔧 Starting database migration...");

    // Add missing columns to orders table
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS note TEXT,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'CASH';
    `);
    console.log("✅ Added missing columns to orders table");

    // Create user_favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        favorite_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, restaurant_id)
      );
    `);
    console.log("✅ Created user_favorites table");

    // Verify
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('address', 'note', 'payment_method');
    `);

    console.log("\n📋 Verified columns in orders table:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase();
