const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "restaurant_finder",
};

async function verify() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      "SHOW TABLES LIKE 'membership_subscriptions'",
    );
    if (rows.length > 0) {
      console.log("✅ Table 'membership_subscriptions' EXISTS!");
      const [cols] = await connection.query(
        "DESCRIBE membership_subscriptions",
      );
      console.log("Columns:", cols.map((c) => c.Field).join(", "));
    } else {
      console.log("❌ Table 'membership_subscriptions' NOT FOUND.");
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verify();
