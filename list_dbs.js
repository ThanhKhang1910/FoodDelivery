const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "127.0.0.1",
  database: "postgres",
  password: "123456",
  port: 5432,
});

const listDbs = async () => {
  try {
    await client.connect();
    console.log("Connected to Postgres root.");

    const res = await client.query("SELECT datname FROM pg_database");
    console.log("Databases found:");
    res.rows.forEach((row) => console.log(` - ${row.datname}`));

    const target = res.rows.find((r) => r.datname === "food_ordering_db");
    if (target) {
      console.log("\nSUCCESS: 'food_ordering_db' FOUND.");
    } else {
      console.log("\nFAILURE: 'food_ordering_db' NOT FOUND.");
    }
  } catch (err) {
    console.error("Connection Error:", err);
  } finally {
    await client.end();
  }
};

listDbs();
