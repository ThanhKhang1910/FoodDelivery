const { Client } = require("pg");
require("dotenv").config();

async function fixForeignKey() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Step 1: Drop old constraint
    console.log("🔧 Removing old foreign key constraint...");
    await client.query(
      "ALTER TABLE Orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey",
    );
    console.log("✅ Old constraint removed\n");

    // Step 2: Add new constraint pointing to Users
    console.log("🔧 Adding new foreign key constraint (Orders -> Users)...");
    await client.query(`
      ALTER TABLE Orders 
      ADD CONSTRAINT orders_customer_id_fkey 
      FOREIGN KEY (customer_id) REFERENCES Users(user_id) ON DELETE CASCADE
    `);
    console.log("✅ New constraint added\n");

    // Verify
    const result = await client.query(`
      SELECT constraint_name, table_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'orders_customer_id_fkey'
    `);

    console.log("📋 Verification:");
    console.table(result.rows);
    console.log("\n🎉 Foreign key fixed successfully!");
    console.log("\n👉 Next: Restart server and try placing an order again!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fixForeignKey();
