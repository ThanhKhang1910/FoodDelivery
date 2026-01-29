SET client_encoding = 'UTF8';

-- 1. Create Rides Table
CREATE TABLE IF NOT EXISTS Rides (
    ride_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customers(customer_id),
    driver_id INT REFERENCES Drivers(driver_id),
    service_type VARCHAR(20) CHECK (service_type IN ('BIKE', 'CAR')),
    pickup_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_long DECIMAL(11, 8),
    dest_lat DECIMAL(10, 8),
    dest_long DECIMAL(11, 8),
    fare DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('SEARCHING', 'ACCEPTED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'SEARCHING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed some BIKE Drivers
-- Driver 1
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Nguyễn Văn Bike 1', 'bike1@gmail.com', '0988000111', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '59-S1 123.45', 'BIKE', 10.776, 106.701, true, 1000000
FROM Users WHERE email = 'bike1@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;

-- Driver 2
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Trần Thị Bike 2', 'bike2@gmail.com', '0988000222', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '59-K2 567.89', 'BIKE', 10.758, 106.675, true, 500000
FROM Users WHERE email = 'bike2@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;

-- Driver 3 (CAR for future)
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Lê Văn Car 1', 'car1@gmail.com', '0988000333', '$2b$10$hash', 'DRIVER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO Drivers (driver_id, vehicle_plate, vehicle_type, current_lat, current_long, is_online, wallet_balance)
SELECT user_id, '51-A 111.11', 'CAR', 10.772, 106.695, true, 2000000
FROM Users WHERE email = 'car1@gmail.com'
ON CONFLICT (driver_id) DO NOTHING;
