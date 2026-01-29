const { Client } = require("pg");

const config = {
  user: "postgres",
  host: "127.0.0.1",
  database: "postgres",
  password: "123456",
  port: 5432,
};

const client = new Client(config);

async function run() {
  try {
    console.log("1. Connecting to 'postgres' database at 127.0.0.1:5432...");
    await client.connect();
    console.log("   -> Connected successfully.");

    console.log("2. Listing databases...");
    const res = await client.query(
      "SELECT datname FROM pg_database WHERE datname='food_ordering_db'",
    );

    if (res.rows.length === 0) {
      console.log("   -> 'food_ordering_db' NOT FOUND.");
      console.log("3. Attempting to CREATE DATABASE food_ordering_db...");
      try {
        await client.query('CREATE DATABASE "food_ordering_db"');
        console.log("   -> CREATE COMMAND EXECUTED SUCCESSFULLY.");
      } catch (createErr) {
        console.error("   -> FAILED TO CREATE DB:", createErr.message);
      }
    } else {
      console.log("   -> 'food_ordering_db' FOUND. It exists.");
    }
  } catch (err) {
    console.error("FATAL ERROR:", err);
  } finally {
    await client.end();
    console.log("4. Connection closed.");
  }
}

run();
