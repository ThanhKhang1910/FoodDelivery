const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  user: process.env.DB_USER,
  host: "127.0.0.1", // Force IPv4
  database: "food_ordering_db",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("Testing connection into food_ordering_db...");

client
  .connect()
  .then(async () => {
    console.log("SUCCESS! Connected to 'food_ordering_db'.");
    console.log("Checking tables...");
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'",
    );
    console.log("Tables found:", res.rows.map((r) => r.table_name).join(", "));
    await client.end();
  })
  .catch((err) => {
    console.error("FAILURE:", err.message);
  });
