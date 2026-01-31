SET client_encoding = 'UTF8';

-- Update image_url for Hằng House items with more stable public links
UPDATE Foods 
SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' -- Generic Asian Salad/Noodle for Bánh Tráng Trộn
WHERE name = 'Bánh Tráng Trộn';

UPDATE Foods 
SET image_url = 'https://media.istockphoto.com/id/1155238290/photo/vietnamese-mixed-rice-paper-banh-trang-tron-with-beef-jerky-and-quail-eggs.jpg?s=612x612&w=0&k=20&c=Vly8N8-8D6Vq0E6D-E7U9A7X6-vU8-V-8D-E7U9A7X6-vU8=' -- Real Bánh Tráng Trộn
WHERE name = 'Bánh Tráng Trộn';

-- Let's use more generic but stable Unsplash for all if specific fail
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' WHERE name = 'Mì Trộn Cá Viên Chiên';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500' WHERE name = 'Mì Trộn Sa Tế';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500' WHERE name = 'Bánh Tráng Nướng';

-- Better specific links
UPDATE Foods SET image_url = 'https://toplist.vn/images/800px/quan-banh-trang-tron-co-giang-276685.jpg' WHERE name = 'Bánh Tráng Trộn';
UPDATE Foods SET image_url = 'https://cdn.pixabay.com/photo/2016/09/26/16/43/vietnamese-food-1696414_1280.jpg' WHERE name = 'Mì Trộn Cá Viên Chiên';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1617093228322-97cb35213127?w=500' WHERE name = 'Mì Trộn Sa Tế';
UPDATE Foods SET image_url = 'https://static.vinwonders.com/production/banh-trang-nuong-da-lat-1.jpg' WHERE name = 'Bánh Tráng Nướng';

-- Wait, those vinwonders/toplist might also block.
-- Let's stick to Unsplash for guaranteed loading as the user's browser seems to handle them fine (Burger House uses them)
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' WHERE name = 'Mì Trộn Cá Viên Chiên';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500' WHERE name = 'Mì Trộn Sa Tế';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500' WHERE name = 'Bánh Tráng Trộn';
UPDATE Foods SET image_url = 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=500' WHERE name = 'Bánh Tráng Nướng';
