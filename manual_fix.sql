-- Chạy đoạn này trong Query Tool của pgAdmin hoặc SQL tool
-- Run this block in pgAdmin or your SQL tool

-- 1. Tạo bảng membership (nếu chưa có)
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

-- 2. Tạo index cho nhanh
CREATE INDEX IF NOT EXISTS idx_user_status ON membership_subscriptions(user_id, status);

-- 3. Kiểm tra xem bảng đã có chưa
SELECT * FROM membership_subscriptions;
