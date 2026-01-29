const db = require("../config/db");

class User {
  static async findByPhone(phone) {
    const query = "SELECT * FROM Users WHERE phone_number = $1";
    const { rows } = await db.query(query, [phone]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM Users WHERE email = $1";
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM Users WHERE user_id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async create({ fullName, email, phone, passwordHash, role }) {
    const query = `
      INSERT INTO Users (full_name, email, phone_number, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [fullName, email, phone, passwordHash, role];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = User;
