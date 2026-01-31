-- Cập nhật tất cả đơn hàng có customer_id = NULL
-- Gán về user_id = 2 (Tran Thanh Khang)

UPDATE Orders 
SET customer_id = 2 
WHERE customer_id IS NULL;

-- Kiểm tra kết quả
SELECT order_id, customer_id, status, created_at 
FROM Orders 
ORDER BY created_at DESC 
LIMIT 10;
