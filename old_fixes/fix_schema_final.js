const { Client } = require("pg");
require("dotenv").config();

async function fixSchema() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log("Connecting to DB...");
    await client.connect();
    console.log("Connected.");

    const columnsToAdd = [
      { name: "address", type: "TEXT" },
      { name: "note", type: "TEXT" },
      { name: "payment_method", type: "VARCHAR(50)" },
      // { name: 'delivery_id', type: 'INT' } // Optional, keeping simple for now
    ];

    for (const col of columnsToAdd) {
      const res = await client.query(
        `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name=$1
      `,
        [col.name],
      );

      if (res.rows.length === 0) {
        console.log(`Adding missing column: ${col.name}`);
        await client.query(
          `ALTER TABLE Orders ADD COLUMN ${col.name} ${col.type}`,
        );
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }
    console.log("Schema check complete.");
  } catch (err) {
    console.error("Schema Fix Error:", err.message);
  } finally {
    await client.end();
  }
}

fixSchema();
