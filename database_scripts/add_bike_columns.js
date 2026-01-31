const db = require("../src/config/db");

const runMigration = async () => {
  const client = await db.pool.connect();
  try {
    console.log("Starting Bike Booking Schema Migration...");
    await client.query("BEGIN");

    // 1. Add service_type column
    await client.query(`
      ALTER TABLE Orders 
      ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'FOOD';
    `);
    console.log("Added service_type column.");

    // 2. Add pickup columns
    await client.query(`
      ALTER TABLE Orders 
      ADD COLUMN IF NOT EXISTS pickup_address TEXT,
      ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8);
    `);
    console.log("Added pickup columns.");

    // 3. Make restaurant_id nullable
    await client.query(`
      ALTER TABLE Orders 
      ALTER COLUMN restaurant_id DROP NOT NULL;
    `);
    console.log("Made restaurant_id nullable.");

    await client.query("COMMIT");
    console.log("Migration executed successfully! 🏍️");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration Failed:", err);
  } finally {
    client.release();
    process.exit();
  }
};

runMigration();
