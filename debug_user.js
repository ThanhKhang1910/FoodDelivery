const db = require("./src/config/db");

const checkUser = async () => {
  try {
    console.log("Checking for user existence...");
    const email = "tranthanhkhang1910@gmail.com";
    const phone = "0344999655";

    const emailRes = await db.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    console.log("Email found:", emailRes.rows.length > 0);
    if (emailRes.rows.length > 0)
      console.log("User details (email):", emailRes.rows[0]);

    const phoneRes = await db.query(
      "SELECT * FROM Users WHERE phone_number = $1",
      [phone],
    );
    console.log("Phone found:", phoneRes.rows.length > 0);
    if (phoneRes.rows.length > 0)
      console.log("User details (phone):", phoneRes.rows[0]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
