-- Database Schema for Food Ordering System
-- Compatible with PostgreSQL (primary target) and MySQL

-- 1. USERS & AUTHENTICATION
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('CUSTOMER', 'RESTAURANT', 'DRIVER', 'ADMIN')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'BANNED', 'PENDING')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Customers (
    customer_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    default_address TEXT,
    loyalty_points INT DEFAULT 0
);

CREATE TABLE Restaurants (
    restaurant_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours JSONB, -- Stores e.g. {"mon": "08:00-22:00"}
    is_open BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00
);

CREATE TABLE Drivers (
    driver_id INT PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    vehicle_plate VARCHAR(50),
    vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('BIKE', 'CAR')),
    current_lat DECIMAL(10, 8),
    current_long DECIMAL(11, 8),
    is_online BOOLEAN DEFAULT FALSE,
    wallet_balance DECIMAL(15, 2) DEFAULT 0.00
);

-- 2. MENU & FOOD
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Foods (
    food_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    category_id INT REFERENCES Categories(category_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    tags JSONB -- For AI Recommendations
);

CREATE TABLE Toppings (
    topping_id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL
);

-- 3. ORDERS
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES Customers(customer_id),
    restaurant_id INT REFERENCES Restaurants(restaurant_id),
    driver_id INT REFERENCES Drivers(driver_id),
    status VARCHAR(50) CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'PICKED_UP', 'DELIVERING', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    total_amount DECIMAL(15, 2) NOT NULL,
    shipping_fee DECIMAL(15, 2) DEFAULT 0.00,
    final_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'WALLET', 'CARD')),
    payment_status VARCHAR(20) CHECK (payment_status IN ('UNPAID', 'PAID')) DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE OrderDetails (
    order_detail_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Orders(order_id) ON DELETE CASCADE,
    food_id INT REFERENCES Foods(food_id),
    quantity INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL -- Price snapshot at booking time
);

CREATE TABLE OrderDetailToppings (
    id SERIAL PRIMARY KEY,
    order_detail_id INT REFERENCES OrderDetails(order_detail_id) ON DELETE CASCADE,
    topping_id INT REFERENCES Toppings(topping_id)
);

-- 4. DELIVERY DETAILS
CREATE TABLE Deliveries (
    delivery_id INT PRIMARY KEY REFERENCES Orders(order_id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_long DECIMAL(11, 8),
    delivery_lat DECIMAL(10, 8),
    delivery_long DECIMAL(11, 8),
    distance_km DECIMAL(5, 2),
    estimated_time_minutes INT
);

-- 5. OPTIONAL: DRIVER LOCATION LOGS (For tracking history)
CREATE TABLE DriverLocations (
    id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES Drivers(driver_id) ON DELETE CASCADE,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_restaurants_lat_long ON Restaurants(latitude, longitude);
CREATE INDEX idx_drivers_online ON Drivers(is_online, current_lat, current_long);
CREATE INDEX idx_orders_customer ON Orders(customer_id);
CREATE INDEX idx_orders_restaurant ON Orders(restaurant_id);
