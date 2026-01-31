-- Seed Data for Hằng House

-- 1. Insert Hằng House User
INSERT INTO Users (full_name, email, phone_number, password_hash, role, status)
VALUES ('Hằng House', 'hanghouse@gmail.com', '0911223344', '$2b$10$YourHashedPasswordHereOrManagedByApp', 'RESTAURANT', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Restaurant Profile
WITH new_user AS (
    SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'
)
INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating)
SELECT user_id, 'Hằng House - Cá Viên Chiên & Ăn Vặt', '456 Nguyen Trai, Q5, HCM', 10.755, 106.67, true, 4.8
FROM new_user
ON CONFLICT (restaurant_id) DO NOTHING;

-- 3. Insert Categories (Mì Trộn, Ăn Vặt)
WITH rest AS (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com')
INSERT INTO Categories (restaurant_id, name)
VALUES 
    ((SELECT user_id FROM rest), 'Mì Trộn'),
    ((SELECT user_id FROM rest), 'Ăn Vặt')
ON CONFLICT DO NOTHING;

-- 4. Insert Foods - Category: Mì Trộn
WITH cat AS (
    SELECT category_id FROM Categories 
    WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com') AND name = 'Mì Trộn'
    LIMIT 1
)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
VALUES
    ((SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'), (SELECT category_id FROM cat), 
     'Mì Trộn Cá Viên Chiên', 35000, 'Mì trộn đậm đà kèm cá viên chiên giòn rụm', 'https://cdn.tgdd.vn/2021/04/CookProduct/Mymix-1200x676.jpg', true),
    
    ((SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'), (SELECT category_id FROM cat), 
     'Mì Trộn Sa Tế', 35000, 'Mì trộn sa tế cay nồng', 'https://beptruong.edu.vn/wp-content/uploads/2018/05/mi-kho-sa-te.jpg', true)
ON CONFLICT DO NOTHING; -- Note: 'name' is not unique constraint but good practice to avoid dups if run multiple times without constraints

-- 5. Insert Foods - Category: Ăn Vặt
WITH cat AS (
    SELECT category_id FROM Categories 
    WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com') AND name = 'Ăn Vặt'
    LIMIT 1
)
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
VALUES
    ((SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'), (SELECT category_id FROM cat), 
     'Bánh Tráng Trộn', 25000, 'Bánh tráng trộn full topping trứng cút, khô bò', 'https://cdn.tgdd.vn/Files/2020/06/18/1263725/cach-lam-banh-trang-tron-tai-nha-sieu-ngon-don-gian-202201080036081498.jpg', true),
     
    ((SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'), (SELECT category_id FROM cat), 
     'Bánh Tráng Nướng', 20000, 'Đà Lạt style', 'https://cdn.tgdd.vn/2021/04/CookProduct/Banh-trang-nuong-mam-ruoc-1200x676.jpg', true)
     
ON CONFLICT DO NOTHING;
