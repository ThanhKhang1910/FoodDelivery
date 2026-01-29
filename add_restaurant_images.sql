SET client_encoding = 'UTF8';

-- 1. Thêm cột image_url vào bảng Restaurants nếu chưa có
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='restaurants' AND column_name='image_url') THEN
        ALTER TABLE Restaurants ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Cập nhật ảnh cho 5 nhà hàng chính
UPDATE Restaurants 
SET image_url = 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800' -- KFC / Chicken fried
WHERE shop_name LIKE '%KFC%';

UPDATE Restaurants 
SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' -- Hằng House / Mixed Salad style
WHERE shop_name LIKE '%Hằng House%';

UPDATE Restaurants 
SET image_url = 'https://images.unsplash.com/photo-1571091718767-18b5c1457add?w=800' -- Burger House
WHERE shop_name LIKE '%Burger House%';

UPDATE Restaurants 
SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' -- Pizza Italiano
WHERE shop_name LIKE '%Pizza Italiano%';

UPDATE Restaurants 
SET image_url = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800' -- Phở & Bún Việt
WHERE shop_name LIKE '%Phở & Bún%';
