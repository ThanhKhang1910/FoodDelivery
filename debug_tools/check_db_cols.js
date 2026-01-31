const db = require("../src/config/db");

async function checkColumns() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    console.log(
      "Columns in Orders table:",
      res.rows.map((r) => r.column_name),
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkColumns();
