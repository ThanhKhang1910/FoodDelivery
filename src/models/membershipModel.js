const pool = require("../config/db");

const Membership = {
  // Auto-create table if missing
  async initTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS membership_subscriptions (
          subscription_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          plan_type VARCHAR(20) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          transaction_info TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved_at TIMESTAMP NULL,
          expires_at TIMESTAMP NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_user_status ON membership_subscriptions(user_id, status);
      `;
      await pool.query(query);
      console.log("✅ Membership table initialized successfully");
    } catch (err) {
      console.error("❌ Error initializing membership table:", err.message);
    }
  },

  // Create a new membership subscription
  async create(data) {
    const query = `
      INSERT INTO membership_subscriptions 
        (user_id, plan_type, amount, payment_method, status, transaction_info, created_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
      RETURNING subscription_id
    `;

    // Postgres uses { rows } structure
    const { rows } = await pool.query(query, [
      data.user_id,
      data.plan_type,
      data.amount,
      data.payment_method,
      data.transaction_info || null,
    ]);

    return rows[0].subscription_id;
  },

  // Get subscription by ID
  async findById(id) {
    const query = `
      SELECT * FROM membership_subscriptions 
      WHERE subscription_id = $1
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Check if user has active membership
  async checkActiveMembership(userId) {
    const query = `
      SELECT * FROM membership_subscriptions 
      WHERE user_id = $1 
        AND status = 'active' 
        AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  },

  // Update subscription status (for admin approval or auto-verify)
  async updateStatus(subscriptionId, status, expiresAt = null) {
    const query = `
      UPDATE membership_subscriptions 
      SET status = $1, 
          approved_at = NOW(),
          expires_at = $2
      WHERE subscription_id = $3
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      status,
      expiresAt,
      subscriptionId,
    ]);

    return rows.length > 0;
  },

  // Get pending subscriptions (for admin)
  async getPending() {
    const query = `
      SELECT ms.*, u.full_name, u.email, u.phone
      FROM membership_subscriptions ms
      JOIN users u ON ms.user_id = u.user_id
      WHERE ms.status = 'pending'
      ORDER BY ms.created_at DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
  },
  // Cancel active subscription
  async cancel(userId) {
    const query = `
      UPDATE membership_subscriptions
      SET status = 'cancelled'
      WHERE user_id = $1 AND status = 'active'
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0;
  },
};

module.exports = Membership;
