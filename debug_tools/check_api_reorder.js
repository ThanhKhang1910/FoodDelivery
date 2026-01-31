const axios = require("axios");
const { Pool } = require("pg");
require("dotenv").config();

// DB Config
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  database: process.env.DB_NAME || "food_ordering_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

const fs = require("fs");

async function check() {
  const client = await pool.connect();
  let latestOrderId = null;
  const logFile = "api_check_result.txt";
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
  };

  fs.writeFileSync(logFile, "--- START CHECK ---\n");

  try {
    const res = await client.query(
      "SELECT order_id FROM Orders ORDER BY order_id DESC LIMIT 1",
    );
    if (res.rows.length > 0) {
      latestOrderId = res.rows[0].order_id;
      log("Latest Order ID: " + latestOrderId);

      log(
        `Checking API: http://localhost:5006/api/v1/orders/debug/${latestOrderId}`,
      );
      try {
        const apiRes = await axios.get(
          `http://localhost:5006/api/v1/orders/debug/${latestOrderId}`,
        );
        log("\n--- API RESPONSE ---");
        log(JSON.stringify(apiRes.data, null, 2));

        if (apiRes.data.items && apiRes.data.items.length > 0) {
          log("\n✅ SUCCESS: API returns items!");
        } else {
          log("\n❌ FAIL: API response is missing 'items' array.");
        }
      } catch (apiErr) {
        log("API Call Failed: " + apiErr.message);
        if (apiErr.response)
          log("Data: " + JSON.stringify(apiErr.response.data));
        if (apiErr.code === "ECONNREFUSED") {
          log("CRITICAL: Server is NOT listening on 5006!");
        }
      }
    } else {
      log("No orders found in DB.");
    }
  } catch (err) {
    log("DB Error: " + err.message);
  } finally {
    client.release();
    pool.end();
  }
}

check();
