const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function fix() {
  const client = await pool.connect();
  try {
    console.log(
      `🔌 Connected to ${process.env.DB_NAME} on ${process.env.DB_HOST}`,
    );

    // 1. Check users table PK
    const userCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    const validCols = userCols.rows.map((r) => r.column_name);
    console.log("👤 Users table columns found.");

    let userIdCol = "user_id";
    if (!validCols.includes("user_id") && validCols.includes("id")) {
      userIdCol = "id";
    }
    console.log(`🔑 Using User FK: ${userIdCol}`);

    // 2. Create membership table
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
        FOREIGN KEY (user_id) REFERENCES users(${userIdCol}) ON DELETE CASCADE
      );
    `;

    await client.query(createSql);
    console.log("✅ Table membership_subscriptions CREATED/VERIFIED.");

    // 3. Create Indexes
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_user_status ON membership_subscriptions(user_id, status);`,
    );

    // 4. List Tables
    const res = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`,
    );
    const tables = res.rows.map((r) => r.table_name);
    console.log("📊 Tables IN DB:", tables.join(", "));
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

fix();
