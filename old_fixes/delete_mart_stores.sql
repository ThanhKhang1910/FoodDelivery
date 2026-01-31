-- Delete Mart Stores and Related Data
-- This will remove the 5 mart stores we added earlier

-- Delete foods first (foreign key constraint)
DELETE FROM Foods WHERE restaurant_id BETWEEN 1001 AND 1005;

-- Delete categories
DELETE FROM Categories WHERE restaurant_id BETWEEN 1001 AND 1005;

-- Delete restaurants
DELETE FROM Restaurants WHERE restaurant_id BETWEEN 1001 AND 1005;

-- Delete users
DELETE FROM Users WHERE user_id BETWEEN 1001 AND 1005;

-- Verify deletion
SELECT 'Remaining restaurants:' as info, COUNT(*) as count FROM Restaurants;
SELECT 'Remaining foods:' as info, COUNT(*) as count FROM Foods;
