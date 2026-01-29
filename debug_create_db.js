const { Client } = require("pg");
require("dotenv").config();

const dbName = "food_ordering_db";

const setup = async () => {
  console.log("Connecting to postgres...");
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log("Connected to postgres.");

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rows.length === 0) {
      console.log(`Database ${dbName} does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} CREATED.`);
    } else {
      console.log(`Database ${dbName} ALREADY EXISTS.`);
    }
  } catch (err) {
    console.error("SETUP ERROR:", err);
  } finally {
    await client.end();
    console.log("Done.");
  }
};

setup();
