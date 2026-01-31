const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "postgres",
  password: "123456",
  port: 5432,
});

console.log("Starting verification...");

client
  .connect()
  .then(async () => {
    console.log("Connected to Postgres!");
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'food_ordering_db'",
    );
    if (res.rows.length === 0) {
      console.log("DB does NOT exist. Creating...");
      await client.query('CREATE DATABASE "food_ordering_db"');
      console.log("DB Created.");
    } else {
      console.log("DB Exists.");
    }
    await client.end();
    console.log("Done.");
  })
  .catch((err) => {
    console.error("Connection Failed:", err);
  });
