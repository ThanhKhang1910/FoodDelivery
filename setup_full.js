const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const dbName = process.env.DB_NAME || "food_ordering_db";

const createDatabase = async () => {
  // Connect to valid default DB 'postgres' to create new DB
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    const res = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rows.length === 0) {
      console.log(`Database ${dbName} not found. Creating...`);
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (e) {
    console.error("Error checking/creating database:", e);
  } finally {
    await pool.end();
  }
};

const runSchemaAndSeed = async () => {
  // Connect to the target DB
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: dbName,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log("Running Schema...");
    const schemaPath = path.join(__dirname, "database_schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schemaSql);
    console.log("Schema applied successfully.");

    console.log("Seeding Data...");

    // Seed Logic Copied & Adapted
    const passwordHash = await bcrypt.hash("123456", 10);

    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM Users WHERE email = $1", [
      "kfc@gmail.com",
    ]);
    let userId;

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].user_id;
    } else {
      const userRes = await pool.query(
        `INSERT INTO Users (full_name, email, phone_number, password_hash, role, status) 
                 VALUES ($1, $2, $3, $4, 'RESTAURANT', 'ACTIVE') RETURNING user_id`,
        ["KFC Vietnam", "kfc@gmail.com", "0909090909", passwordHash],
      );
      userId = userRes.rows[0].user_id;
    }

    // Restaurant
    const resCheck = await pool.query(
      "SELECT * FROM Restaurants WHERE restaurant_id = $1",
      [userId],
    );
    if (resCheck.rows.length === 0) {
      await pool.query(
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
    }

    // Category
    let catId;
    const catCheck = await pool.query(
      "SELECT * FROM Categories WHERE restaurant_id = $1 AND name = $2",
      [userId, "Gà Rán"],
    );
    if (catCheck.rows.length > 0) {
      catId = catCheck.rows[0].category_id;
    } else {
      const catRes = await pool.query(
        `INSERT INTO Categories (restaurant_id, name) VALUES ($1, $2) RETURNING category_id`,
        [userId, "Gà Rán"],
      );
      catId = catRes.rows[0].category_id;
    }

    // Food
    const foodCheck = await pool.query(
      "SELECT * FROM Foods WHERE name = $1 AND restaurant_id = $2",
      ["Combo Gà Rán", userId],
    );
    if (foodCheck.rows.length === 0) {
      await pool.query(
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
    }

    console.log("Seeding completed successfully.");
  } catch (e) {
    console.error("Error running schema/seed:", e);
  } finally {
    await pool.end();
  }
};

const main = async () => {
  await createDatabase();
  await runSchemaAndSeed();
};

main();
