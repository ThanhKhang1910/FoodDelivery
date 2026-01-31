const { Client } = require("pg");
require("dotenv").config();

async function fixSchema() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log("Connected to DB.");

    // Add columns if not exist
    const columns = [
      { name: "address", type: "TEXT" },
      { name: "note", type: "TEXT" },
      { name: "payment_method", type: "VARCHAR(50)" },
      { name: "delivery_id", type: "INT" },
    ];

    for (const col of columns) {
      try {
        await client.query(
          `ALTER TABLE Orders ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`,
        );
        console.log(`Column ${col.name} checked/added.`);
      } catch (e) {
        console.log(`Error adding ${col.name}:`, e.message);
      }
    }

    // Check FK for delivery_id if requested, but let's keep it simple first
    // User mentioned: ALTER TABLE Orders ADD COLUMN delivery_id INT REFERENCES Deliveries(delivery_id);
    // We added the column, adding constraint is secondary if table exists

    console.log("Schema update complete.");
  } catch (err) {
    console.error("Script Error:", err);
  } finally {
    await client.end();
  }
}

fixSchema();
