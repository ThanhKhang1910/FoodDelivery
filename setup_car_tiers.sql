SET client_encoding = 'UTF8';

-- 1. Thêm cột vehicle_class vào bảng Drivers nếu chưa có
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='vehicle_class') THEN
        ALTER TABLE Drivers ADD COLUMN vehicle_class VARCHAR(50) DEFAULT 'STANDARD';
    END IF;
END $$;

-- 2. Đăng ký thêm tài xế Ô tô với các hạng khác nhau
-- Car thường (Standard)
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Trần Văn Car thường', 'car_normal@gmail.com', '0977111001', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, vehicle_class, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '51-G1 123.45', 'CAR', 'STANDARD', 10.778, 106.699, true, 1000000
FROM Users WHERE email = 'car_normal@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;

-- Car Business
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Lê Thị Business', 'car_business@gmail.com', '0977111002', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, vehicle_class, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '51-B2 555.66', 'CAR', 'BUSINESS', 10.782, 106.705, true, 2000000
FROM Users WHERE email = 'car_business@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;

-- Car Limo
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Phạm Hùng Limo', 'car_limo@gmail.com', '0977111003', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, vehicle_class, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '51-L6 999.99', 'CAR', 'LIMO', 10.770, 106.690, true, 5000000
FROM Users WHERE email = 'car_limo@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;
