const Membership = require("./src/models/membershipModel");
const pool = require("./src/config/db");
require("dotenv").config();

async function test() {
  try {
    console.log("🛠 Testing Membership Creation...");

    // 1. Get a test user
    const userRes = await pool.query("SELECT user_id FROM users LIMIT 1");
    if (userRes.rows.length === 0) {
      console.log("❌ No users found in DB. Cannot test FK.");
      process.exit(1);
    }
    const userId = userRes.rows[0].user_id;
    console.log("👤 Using Test User ID:", userId);

    // 2. Try to create subscription
    const subId = await Membership.create({
      user_id: userId,
      plan_type: "1_month_test",
      amount: 135000,
      payment_method: "test_script",
      transaction_info: "Debug Script Test",
    });

    console.log("✅ Success! Created Subscription ID:", subId);

    // 3. Verify it exists
    const sub = await Membership.findById(subId);
    console.log("📋 Retrieved Subscription:", sub);
  } catch (error) {
    console.error("❌ FAILURE:", error);
  } finally {
    // End pool to exit process
    // pool.pool.end() if it exports pool property, or just wait?
    // db.js exports { query, pool }.
    if (pool.pool) await pool.pool.end();
  }
}

test();
