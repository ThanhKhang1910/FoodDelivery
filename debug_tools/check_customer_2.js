const { Client } = require("pg");
require("dotenv").config();

async function checkCustomer2() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();

    console.log("\n=== 1. Tổng số đơn hàng trong DB ===");
    const total = await client.query("SELECT COUNT(*) as count FROM Orders");
    console.log(`📊 Tổng: ${total.rows[0].count} đơn hàng`);

    if (total.rows[0].count > 0) {
      console.log("\n=== 2. Danh sách customer_id có đơn hàng ===");
      const customerIds = await client.query(`
        SELECT DISTINCT customer_id, COUNT(*) as order_count
        FROM Orders
        GROUP BY customer_id
        ORDER BY customer_id
      `);
      console.table(customerIds.rows);

      console.log("\n=== 3. Kiểm tra đơn hàng của customer_id = 2 ===");
      const customer2Orders = await client.query(`
        SELECT order_id, customer_id, restaurant_id, status, created_at, total_amount
        FROM Orders
        WHERE customer_id = 2
        ORDER BY created_at DESC
      `);
      console.log(`Tìm thấy: ${customer2Orders.rows.length} đơn`);
      if (customer2Orders.rows.length > 0) {
        console.table(customer2Orders.rows);
      }

      console.log("\n=== 4. Thông tin User ID = 2 ===");
      const user = await client.query(
        "SELECT user_id, email, full_name FROM Users WHERE user_id = 2",
      );
      if (user.rows.length > 0) {
        console.table(user.rows);
      } else {
        console.log("❌ Không tìm thấy user với ID = 2!");
      }

      console.log("\n=== 5. Tất cả đơn hàng (5 đơn gần nhất) ===");
      const allOrders = await client.query(`
        SELECT o.order_id, o.customer_id, u.email, o.status, o.created_at
        FROM Orders o
        LEFT JOIN Users u ON o.customer_id = u.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);
      console.table(allOrders.rows);
    } else {
      console.log("\n❌ DATABASE RỖNG - không có đơn hàng nào!");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

checkCustomer2();
