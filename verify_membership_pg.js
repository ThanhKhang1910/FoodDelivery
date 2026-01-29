const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function verify() {
  try {
    const client = await pool.connect();

    // Check if table exists in information_schema
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'membership_subscriptions'
      );
    `;

    const { rows } = await client.query(checkQuery);
    const exists = rows[0].exists;

    if (exists) {
      console.log("✅ Table 'membership_subscriptions' EXISTS in PostgreSQL!");

      // Get columns
      const colsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'membership_subscriptions';
      `;
      const cols = await client.query(colsQuery);
      console.log(
        "Columns:",
        cols.rows.map((c) => `${c.column_name} (${c.data_type})`).join(", "),
      );
    } else {
      console.log(
        "❌ Table 'membership_subscriptions' NOT FOUND in PostgreSQL.",
      );
    }

    client.release();
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  } finally {
    await pool.end();
  }
}

verify();
