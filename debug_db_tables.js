const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function listTables() {
  try {
    const client = await pool.connect();
    console.log(`🔌 Connected to database: ${process.env.DB_NAME}`);

    // Get all tables
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const { rows } = await client.query(query);
    console.log(`📊 Found ${rows.length} tables:`);
    rows.forEach((row) => {
      const mark = row.table_name === "membership_subscriptions" ? "✅" : "  ";
      console.log(`${mark} ${row.table_name}`);
    });

    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

listTables();
