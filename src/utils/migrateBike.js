const db = require("../config/db");

const migrateBikeFeature = async () => {
  const client = await db.pool.connect();
  try {
    console.log("[Migration] Checking Bike Booking Schema & Data...");
    await client.query("BEGIN");

    // 1. Schema Update
    await client.query(`
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'FOOD';
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS pickup_address TEXT;
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8);
      ALTER TABLE Orders ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8);
      ALTER TABLE Orders ALTER COLUMN restaurant_id DROP NOT NULL;
    `);

    // 2. Data Seeding (BronAuto Service)
    let restaurantId;
    const resQuery = await client.query(
      "SELECT restaurant_id FROM Restaurants WHERE shop_name = 'BronAuto Services'",
    );

    if (resQuery.rows.length === 0) {
      // We must create a linked USER first due to FK constraint (Restaurants.restaurant_id -> Users.user_id)
      // Check if System User exists
      const sysUserQuery = await client.query(
        "SELECT user_id FROM Users WHERE email = 'bike_system@bronauto.com'",
      );
      let sysUserId;

      if (sysUserQuery.rows.length === 0) {
        const userInsert = await client.query(`
                INSERT INTO Users (full_name, email, password_hash, phone_number, role)
                VALUES ('BronAuto System', 'bike_system@bronauto.com', '$2b$10$bike_placeholder_hash', '0000000000', 'RESTAURANT')
                RETURNING user_id;
             `);
        sysUserId = userInsert.rows[0].user_id;
        console.log(`[Migration] Created System User (ID: ${sysUserId})`);
      } else {
        sysUserId = sysUserQuery.rows[0].user_id;
      }

      // Use User ID as Restaurant ID
      const insertRes = await client.query(
        `
            INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, image_url, is_open) 
            VALUES ($1, 'BronAuto Services', 'System', 0, 0, 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', TRUE)
            RETURNING restaurant_id;
        `,
        [sysUserId],
      );
      restaurantId = insertRes.rows[0].restaurant_id;
      console.log(
        `[Migration] Created 'BronAuto Services' (ID: ${restaurantId})`,
      );
    } else {
      restaurantId = resQuery.rows[0].restaurant_id;
    }

    // Upsert Food Item (Bike Trip)
    const foodQuery = await client.query(
      "SELECT food_id FROM Foods WHERE name = 'Đặt xe 2 bánh' AND restaurant_id = $1",
      [restaurantId],
    );

    if (foodQuery.rows.length === 0) {
      await client.query(
        `
            INSERT INTO Foods (restaurant_id, name, description, price, image_url, is_available)
            VALUES ($1, 'Đặt xe 2 bánh', 'Dịch vụ xe ôm công nghệ', 0, 'https://cdn-icons-png.flaticon.com/512/171/171253.png', TRUE)
        `,
        [restaurantId],
      );
      console.log("[Migration] Created 'Đặt xe 2 bánh' Service Item");
    }

    await client.query("COMMIT");
    console.log("[Migration] Bike Feature Ready ✅");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Migration] Failed:", err);
  } finally {
    client.release();
  }
};

module.exports = migrateBikeFeature;
