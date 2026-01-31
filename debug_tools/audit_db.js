const { pool } = require("../src/config/db");

async function audit() {
  const client = await pool.connect();
  try {
    console.log("--- DATABASE AUDIT REPORT V2 ---");

    // 1. Check Tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map((r) => r.table_name);
    console.log("Existing Tables:", tables.join(", "));

    // 2. Check Orders Columns
    const orderColsRes = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    const orderCols = orderColsRes.rows.reduce((acc, r) => {
      acc[r.column_name] = r.is_nullable;
      return acc;
    }, {});
    console.log("Orders Columns Checks:");
    console.log("- customer_latitude:", !!orderCols.customer_latitude);
    console.log("- pickup_address:", !!orderCols.pickup_address);
    console.log("- service_type:", !!orderCols.service_type);
    console.log(
      "- restaurant_id is nullable:",
      orderCols.restaurant_id === "YES",
    );

    // 3. Check for Mart Stores
    const martRes = await client.query(
      "SELECT COUNT(*) FROM Restaurants WHERE shop_name ILIKE '%Mart%'",
    );
    console.log("Mart Restaurants Count:", martRes.rows[0].count);

    // 4. Check for Membership Subscriptions
    const hasMemberships = tables.includes("membership_subscriptions");
    console.log("membership_subscriptions Table Exists:", hasMemberships);

    // 5. Check for User Favorites
    const hasFavorites = tables.includes("user_favorites");
    console.log("user_favorites Table Exists:", hasFavorites);

    // 6. Check for Restaurant Ratings/Opening Hours
    const resColsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants'
    `);
    const resCols = resColsRes.rows.map((r) => r.column_name);
    console.log("- Restaurants has image_url:", resCols.includes("image_url"));
  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}

audit();
