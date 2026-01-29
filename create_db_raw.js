const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "postgres",
  password: "123456",
  port: 5432,
});

async function main() {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected. Creating DB...");
    await client.query('CREATE DATABASE "food_ordering_db"');
    console.log("SUCCESS: Database created.");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await client.end();
  }
}

main();
