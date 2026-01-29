const db = require("./src/config/db");
const bcrypt = require("bcrypt");

const seed = async () => {
  try {
    console.log("Starting seed...");

    // 1. Create Restaurant Users
    const passwordHash = await bcrypt.hash("123456", 10);

    // Check if user exists to avoid duplicate errors
    const userCheck = await db.query("SELECT * FROM Users WHERE email = $1", [
      "kfc@gmail.com",
    ]);
    let userId;

    if (userCheck.rows.length > 0) {
      console.log("User already exists, skipping user creation.");
      userId = userCheck.rows[0].user_id;
    } else {
      const userRes = await db.query(
        `INSERT INTO Users (full_name, email, phone_number, password_hash, role, status) 
         VALUES ($1, $2, $3, $4, 'RESTAURANT', 'ACTIVE') RETURNING user_id`,
        ["KFC Vietnam", "kfc@gmail.com", "0909090909", passwordHash],
      );
      userId = userRes.rows[0].user_id;
      console.log("Created User: KFC");
    }

    // 2. Create Restaurant Profile
    const resCheck = await db.query(
      "SELECT * FROM Restaurants WHERE restaurant_id = $1",
      [userId],
    );

    if (resCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
         VALUES ($1, $2, $3, $4, $5, true, 4.5)`,
        [
          userId,
          "KFC Nguyen Van Cu",
          "123 Nguyen Van Cu, Q5, HCM",
          10.762622,
          106.660172,
        ],
      );
      console.log("Created Restaurant Profile: KFC");
    }

    // 3. Create Categories
    let catId;
    const catCheck = await db.query(
      "SELECT * FROM Categories WHERE restaurant_id = $1 AND name = $2",
      [userId, "Gà Rán"],
    );
    if (catCheck.rows.length > 0) {
      catId = catCheck.rows[0].category_id;
    } else {
      const catRes = await db.query(
        `INSERT INTO Categories (restaurant_id, name) VALUES ($1, $2) RETURNING category_id`,
        [userId, "Gà Rán"],
      );
      catId = catRes.rows[0].category_id;
      console.log("Created Category: Gà Rán");
    }

    // 4. Create Food
    const foodCheck = await db.query(
      "SELECT * FROM Foods WHERE name = $1 AND restaurant_id = $2",
      ["Combo Gà Rán", userId],
    );
    if (foodCheck.rows.length === 0) {
      await db.query(
        `INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [
          userId,
          catId,
          "Combo Gà Rán",
          89000,
          "2 Miếng gà giòn cay + 1 Pepsi",
          "https://static.kfcvietnam.com.vn/images/items/lg/D-C-Ga-Gion-Cay.jpg?v=4",
        ],
      );
      console.log("Created Food: Combo Gà Rán");
    }

    // Add another restaurant (McDonalds)
    // ... Simplified for now to ensure at least one shows up

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
