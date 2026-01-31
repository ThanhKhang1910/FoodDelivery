-- Seed Data for Food Ordering System

-- 1. Insert KFC User (Password: 123456)
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('KFC Vietnam', 'kfc@gmail.com', '0909090909', '$2b$10$YourHashedPasswordHereOrManagedByApp', 'RESTAURANT', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Restaurant Profile (Assuming ID 1 for simplicity in raw SQL, but best to subquery)
-- We need to find the user_id first
WITH new_user AS (
    SELECT user_id FROM Users WHERE email = 'kfc@gmail.com'
)
INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
SELECT user_id, 'KFC Nguyen Van Cu', '123 Nguyen Van Cu, Q5, HCM', 10.762622, 106.660172, true, 4.5
FROM new_user
ON CONFLICT (restaurant_id) DO NOTHING;

-- 3. Insert Category
WITH rest AS (SELECT user_id FROM Users WHERE email = 'kfc@gmail.com')
INSERT INTO Categories (restaurant_id, name)
SELECT user_id, 'Gà Rán' FROM rest
ON CONFLICT DO NOTHING;

-- 4. Insert Food
WITH cat AS (
    SELECT category_id FROM Categories 
    WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'kfc@gmail.com') 
    LIMIT 1
)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
SELECT 
    (SELECT user_id FROM Users WHERE email = 'kfc@gmail.com'),
    category_id,
    'Combo Gà Rán',
    89000,
    '2 Miếng gà giòn cay + 1 Pepsi',
    'https://static.kfcvietnam.com.vn/images/items/lg/D-C-Ga-Gion-Cay.jpg?v=4',
    true
FROM cat
WHERE NOT EXISTS (
    SELECT 1 FROM Foods WHERE name = 'Combo Gà Rán'
);
