const db = require("../src/config/db");

const checkSchema = async () => {
  try {
    const query = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'service_type';
        `;
    const res = await db.query(query);
    if (res.rows.length > 0) {
      console.log("SCHEMA CHECK: OK (Column 'service_type' exists)");
    } else {
      console.log("SCHEMA CHECK: FAILED (Column 'service_type' MISSING)");
    }
    process.exit();
  } catch (e) {
    console.error("SCHEMA CHECK ERROR:", e);
    process.exit(1);
  }
};

checkSchema();
