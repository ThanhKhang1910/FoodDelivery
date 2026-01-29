const axios = require("axios");
const pool = require("./src/config/db");

async function testCancel() {
  try {
    // 1. Get a user
    const { rows } = await pool.query("SELECT * FROM users LIMIT 1");
    if (rows.length === 0) {
      console.log("No users found");
      return;
    }
    const user = rows[0];
    console.log("Testing with user:", user.email);

    // 2. Login to get token (simulated or real)
    // Actually, since this is a backend script, I can't easily sign a token unless I import the secret.
    // Let's just create a subscription directly in DB to ensure there is one to cancel.

    await pool.query(
      "INSERT INTO membership_subscriptions (user_id, plan_type, amount, payment_method, status, expires_at) VALUES ($1, '1_month', 135000, 'cash', 'active', NOW() + INTERVAL '1 month') RETURNING subscription_id",
      [user.user_id],
    );
    console.log("Created active subscription for test.");

    // 3. We can't easily hit the API without the JWT secret to sign a token.
    // So let's check the env file for secret.

    console.log(
      "To test the API, we need a valid token. Running a manual DB check instead to verify model logic...",
    );

    // Test Model logic directly first
    const Membership = require("./src/models/membershipModel");
    const result = await Membership.cancel(user.user_id);
    console.log("Model.cancel result:", result);

    if (result) {
      console.log("✅ Model logic works. Database updated.");
    } else {
      console.log("❌ Model logic failed to update.");
    }
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    pool.end();
  }
}

testCancel();
