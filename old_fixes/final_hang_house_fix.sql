SET client_encoding = 'UTF8';

-- 1. DELETE existing data for Hang House to start fresh
DELETE FROM Foods WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com');
DELETE FROM Categories WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com');

-- 2. RE-INSERT Categories
WITH rest AS (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com')
INSERT INTO Categories (restaurant_id, name)
VALUES 
    ((SELECT user_id FROM rest), 'Mì Trộn'),
    ((SELECT user_id FROM rest), 'Ăn Vặt');

-- 3. RE-INSERT Foods with correct category linking
-- Mì Trộn items
WITH rest AS (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'),
     cat AS (SELECT category_id FROM Categories WHERE name = 'Mì Trộn' AND restaurant_id = (SELECT user_id FROM rest))
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
VALUES
    ((SELECT user_id FROM rest), (SELECT category_id FROM cat), 
     'Mì Trộn Cá Viên Chiên', 35000, 'Mì trộn đậm đà kèm cá viên chiên giòn rụm', 'https://cdn.tgdd.vn/2021/04/CookProduct/Mymix-1200x676.jpg', true),
    ((SELECT user_id FROM rest), (SELECT category_id FROM cat), 
     'Mì Trộn Sa Tế', 35000, 'Mì trộn sa tế cay nồng', 'https://beptruong.edu.vn/wp-content/uploads/2018/05/mi-kho-sa-te.jpg', true);

-- Ăn Vặt items
WITH rest AS (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com'),
     cat AS (SELECT category_id FROM Categories WHERE name = 'Ăn Vặt' AND restaurant_id = (SELECT user_id FROM rest))
INSERT INTO Foods (restaurant_id, category_id, name, price, description, image_url, is_available)
VALUES
    ((SELECT user_id FROM rest), (SELECT category_id FROM cat), 
     'Bánh Tráng Trộn', 25000, 'Bánh tráng trộn full topping trứng cút, khô bò', 'https://cdn.tgdd.vn/Files/2020/06/18/1263725/cach-lam-banh-trang-tron-tai-nha-sieu-ngon-don-gian-202201080036081498.jpg', true),
    ((SELECT user_id FROM rest), (SELECT category_id FROM cat), 
     'Bánh Tráng Nướng', 20000, 'Đà Lạt style', 'https://cdn.tgdd.vn/2021/04/CookProduct/Banh-trang-nuong-mam-ruoc-1200x676.jpg', true);
