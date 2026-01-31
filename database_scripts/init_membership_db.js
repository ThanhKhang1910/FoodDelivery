const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "food_ordering_db",
};

async function initDb() {
  let connection;
  try {
    console.log("🔄 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected!");

    const sqlPath = path.join(__dirname, "create_membership_table.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Split queries by semicolon to run them one by one if needed,
    // but multiline support usually works. Let's try running the whole block
    // or splitting if it's multiple statements.
    // simpler approach for this specific file: assume it creates one table.

    console.log("🚀 Executing SQL...");
    // The file might contain comments and multiple statements.
    // Let's manually define the query to be safe and robust against file parsing issues.

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS membership_subscriptions (
        subscription_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        plan_type VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status),
        INDEX idx_status (status),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log("✅ Table 'membership_subscriptions' created successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
