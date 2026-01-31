const { Client } = require("pg");
require("dotenv").config();

async function fixExistingOrders() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();

    console.log("🔧 Fixing customer_id for existing orders...\n");

    // Get current logged-in user (assuming Tran Thanh Khang = user_id 2)
    const user = await client.query(`
      SELECT user_id, email, full_name 
      FROM Users 
      WHERE full_name LIKE '%Khang%' OR user_id = 2
      LIMIT 1
    `);

    if (user.rows.length === 0) {
      console.log(
        "❌ Không tìm thấy user. Vui lòng cung cấp user_id thủ công.",
      );
      return;
    }

    const userId = user.rows[0].user_id;
    console.log(`👤 User: ${user.rows[0].full_name} (ID: ${userId})`);

    // Update all orders with NULL customer_id
    const result = await client.query(
      `
      UPDATE Orders 
      SET customer_id = $1 
      WHERE customer_id IS NULL
      RETURNING order_id
    `,
      [userId],
    );

    console.log(
      `\n✅ Đã cập nhật ${result.rowCount} đơn hàng với customer_id = ${userId}`,
    );

    if (result.rows.length > 0) {
      console.log("\nCác đơn đã cập nhật:");
      console.log(result.rows.map((r) => `Order #${r.order_id}`).join(", "));
    }

    // Verify
    const check = await client.query(
      `
      SELECT COUNT(*) as count 
      FROM Orders 
      WHERE customer_id = $1
    `,
      [userId],
    );

    console.log(
      `\n📊 Tổng đơn hàng của user ${userId}: ${check.rows[0].count}`,
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

fixExistingOrders();
