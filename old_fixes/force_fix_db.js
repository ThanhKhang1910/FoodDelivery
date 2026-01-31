const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function forceInit() {
  const client = await pool.connect();
  try {
    console.log(`🔌 Connected to ${process.env.DB_NAME}`);

    // Create Table
    const createSql = `
      CREATE TABLE IF NOT EXISTS membership_subscriptions (
        subscription_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        plan_type VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `;
    await client.query(createSql);
    console.log("✅ Table membership_subscriptions created.");

    // Create Indexes
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_user_status ON membership_subscriptions(user_id, status);`,
    );
    console.log("✅ Indexes created.");

    // Verify
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'membership_subscriptions'
    `);

    if (res.rows.length > 0) {
      console.log("🎉 VERIFICATION PASSED: Table exists.");
    } else {
      console.error(
        "❌ VERIFICATION FAILED: Table not found after creation attempt.",
      );
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

forceInit();
