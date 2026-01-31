const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bronauto",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

async function deleteMartStores() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("Deleting mart store foods...");
    const foodsResult = await client.query(
      "DELETE FROM Foods WHERE restaurant_id BETWEEN 1001 AND 1005",
    );
    console.log(`✅ Deleted ${foodsResult.rowCount} foods`);

    console.log("Deleting mart store categories...");
    const catsResult = await client.query(
      "DELETE FROM Categories WHERE restaurant_id BETWEEN 1001 AND 1005",
    );
    console.log(`✅ Deleted ${catsResult.rowCount} categories`);

    console.log("Deleting mart restaurants...");
    const restsResult = await client.query(
      "DELETE FROM Restaurants WHERE restaurant_id BETWEEN 1001 AND 1005",
    );
    console.log(`✅ Deleted ${restsResult.rowCount} restaurants`);

    console.log("Deleting mart users...");
    const usersResult = await client.query(
      "DELETE FROM Users WHERE user_id BETWEEN 1001 AND 1005",
    );
    console.log(`✅ Deleted ${usersResult.rowCount} users`);

    await client.query("COMMIT");

    // Verify
    const remainingRests = await client.query(
      "SELECT COUNT(*) FROM Restaurants",
    );
    const remainingFoods = await client.query("SELECT COUNT(*) FROM Foods");

    console.log("\n🎉 SUCCESS!");
    console.log(`Remaining restaurants: ${remainingRests.rows[0].count}`);
    console.log(`Remaining foods: ${remainingFoods.rows[0].count}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error deleting mart stores:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

deleteMartStores()
  .then(() => {
    console.log("\n✨ All mart stores deleted successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed to delete mart stores:", error.message);
    process.exit(1);
  });
