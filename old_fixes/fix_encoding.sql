SET client_encoding = 'UTF8';

-- Fix Restaurant Names
UPDATE Restaurants 
SET shop_name = 'Hằng House - Cá Viên Chiên & Ăn Vặt' 
WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com');

-- Fix Categories
UPDATE Categories 
SET name = 'Mì Trộn' 
WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com') AND name LIKE 'M%';

UPDATE Categories 
SET name = 'Ăn Vặt' 
WHERE restaurant_id = (SELECT user_id FROM Users WHERE email = 'hanghouse@gmail.com') AND (name LIKE '%V%' OR name LIKE '%B%');

-- Fix Food Names
UPDATE Foods 
SET name = 'Mì Trộn Cá Viên Chiên', description = 'Mì trộn đậm đà kèm cá viên chiên giòn rụm' 
WHERE name LIKE 'M%' AND name LIKE '%C%';

UPDATE Foods 
SET name = 'Mì Trộn Sa Tế', description = 'Mì trộn sa tế cay nồng' 
WHERE name LIKE 'M%' AND name LIKE '%S%';

UPDATE Foods 
SET name = 'Bánh Tráng Trộn', description = 'Bánh tráng trộn full topping trứng cút, khô bò' 
WHERE name LIKE 'B%' AND name LIKE '%T%';

UPDATE Foods 
SET name = 'Bánh Tráng Nướng', description = 'Đà Lạt style' 
WHERE name LIKE 'B%' AND name LIKE '%N%';
