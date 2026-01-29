SET client_encoding = 'UTF8';

-- 1. Create Users
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES 
    ('Burger House Admin', 'burgerhouse@gmail.com', '0911000111', '$2b$10$hash', 'RESTAURANT', 'ACTIVE'),
    ('Pizza Italiano Admin', 'pizzaitaliano@gmail.com', '0911000222', '$2b$10$hash', 'RESTAURANT', 'ACTIVE'),
    ('Phở Việt Admin', 'phoviet@gmail.com', '0911000333', '$2b$10$hash', 'RESTAURANT', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 2. Create Restaurants
-- Burger House
WITH u AS (SELECT user_id FROM Users WHERE email = 'burgerhouse@gmail.com')
INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
SELECT user_id, 'Burger House - Chuẩn Vị Mỹ', '120 Lê Lợi, Quận 1, HCM', 10.771, 106.698, true, 4.8
FROM u ON CONFLICT (restaurant_id) DO NOTHING;

-- Pizza Italiano
WITH u AS (SELECT user_id FROM Users WHERE email = 'pizzaitaliano@gmail.com')
INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
SELECT user_id, 'Pizza Italiano - Truyền Thống Ý', '85 Tú Xương, Quận 3, HCM', 10.782, 106.685, true, 4.9
FROM u ON CONFLICT (restaurant_id) DO NOTHING;

-- Phở & Bún Việt
WITH u AS (SELECT user_id FROM Users WHERE email = 'phoviet@gmail.com')
INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
SELECT user_id, 'Phở & Bún Việt - Thuần Việt', '256 Bà Hạt, Quận 10, HCM', 10.765, 106.668, true, 4.9
FROM u ON CONFLICT (restaurant_id) DO NOTHING;

-- 3. Categories & Foods for Burger House
WITH r AS (SELECT user_id FROM Users WHERE email = 'burgerhouse@gmail.com'),
     c AS (INSERT INTO Categories (restaurant_id, name) VALUES ((SELECT user_id FROM r), 'Burger Special') RETURNING category_id)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
SELECT (SELECT user_id FROM r), (SELECT category_id FROM c), name, price, descr, img, true
FROM (VALUES 
    ('Classic Beef Burger', 85000, 'Burger bò chuẩn vị Mỹ (⭐4.8)', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'),
    ('Cheese Bacon Burger', 95000, 'Burger bò phô mai xông khói (⭐4.9)', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500'),
    ('Double Beef Burger', 125000, 'Nhân đôi thịt bò mọng nước (⭐4.7)', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500'),
    ('Chicken Crispy Burger', 79000, 'Burger gà giòn tan (⭐4.6)', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500'),
    ('BBQ Beef Burger', 89000, 'Burger bò sốt BBQ đậm đà (⭐4.8)', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'),
    ('French Fries Special', 45000, 'Khoai tây chiên đặc biệt (⭐4.5)', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'),
    ('Combo Burger + Coke', 110000, 'Combo tiết kiệm (⭐4.7)', 'https://images.unsplash.com/photo-1513185158878-8d8c182b013b?w=500')
) AS f(name, price, descr, img);

-- 4. Categories & Foods for Pizza Italiano
WITH r AS (SELECT user_id FROM Users WHERE email = 'pizzaitaliano@gmail.com'),
     c AS (INSERT INTO Categories (restaurant_id, name) VALUES ((SELECT user_id FROM r), 'Pizza & Pasta') RETURNING category_id)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
SELECT (SELECT user_id FROM r), (SELECT category_id FROM c), name, price, descr, img, true
FROM (VALUES 
    ('Pizza Margherita', 150000, 'Sốt cà chua, Mozzarella, húng tây (⭐4.7)', 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500'),
    ('Pizza Pepperoni', 180000, 'Xúc xích Ý cay nồng (⭐4.9)', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500'),
    ('Pizza Hải Sản', 220000, 'Tôm, mực, thanh cua tươi (⭐4.8)', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500'),
    ('Pizza 4 Cheese', 190000, '4 loại phô mai thượng hạng (⭐4.6)', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'),
    ('Pizza Gà Nướng BBQ', 175000, 'Gà nướng sốt BBQ (⭐4.7)', 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500'),
    ('Mì Ý Carbonara', 120000, 'Mì Ý sốt kem trứng (⭐4.8)', 'https://images.unsplash.com/photo-1612459284970-e8f027596582?w=500'),
    ('Combo Pizza Gia Đình', 450000, '2 Pizza lớn + 1 Mì Ý (⭐4.9)', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500')
) AS f(name, price, descr, img);

-- 5. Categories & Foods for Phở & Bún Việt
WITH r AS (SELECT user_id FROM Users WHERE email = 'phoviet@gmail.com'),
     c AS (INSERT INTO Categories (restaurant_id, name) VALUES ((SELECT user_id FROM r), 'Món Việt') RETURNING category_id)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
SELECT (SELECT user_id FROM r), (SELECT category_id FROM c), name, price, descr, img, true
FROM (VALUES 
    ('Phở Bò Tái', 55000, 'Thịt bò tươi chần sơ (⭐4.9)', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500'),
    ('Phở Bò Viên', 55000, 'Bò viên dai giòn (⭐4.7)', 'https://images.unsplash.com/photo-1621319309255-730303b3064d?w=500'),
    ('Bún Bò Huế', 65000, 'Đậm đà vị mắm ruốc (⭐4.8)', 'https://images.unsplash.com/photo-1591814447921-72420993540c?w=500'),
    ('Bún Riêu Cua', 45000, 'Vị chua thanh mát (⭐4.6)', 'https://images.unsplash.com/photo-1582450871972-ed39b03987e7?w=500'),
    ('Cơm Tấm Sườn', 45000, 'Sườn nướng mặn ngọt (⭐4.9)', 'https://images.unsplash.com/photo-1624634281318-68783416b2f6?w=500'),
    ('Bánh Cuốn Nóng', 35000, 'Kèm chả lụa và nước mắm (⭐4.5)', 'https://images.unsplash.com/photo-1599387737834-0d48af908f90?w=500'),
    ('Trà Đá / Trà Chanh', 15000, 'Mát rượi (⭐4.4)', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500')
) AS f(name, price, descr, img);
