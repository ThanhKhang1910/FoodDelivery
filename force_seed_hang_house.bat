@echo off
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [START] Force Seeding Hằng House...

%PSQL% -U postgres -h 127.0.0.1 -d %DB% -c "INSERT INTO Users (full_name, email, phone_number, password_hash, role, status) VALUES ('Hằng House', 'hanghouse@gmail.com', '0911223344', 'hash', 'RESTAURANT', 'ACTIVE') ON CONFLICT (email) DO NOTHING;"

%PSQL% -U postgres -h 127.0.0.1 -d %DB% -c "INSERT INTO Restaurants (restaurant_id, shop_name, address, latitude, longitude, is_open, rating) SELECT user_id, 'Hằng House - Cá Viên Chiên & Ăn Vặt', '456 Nguyen Trai, Q5, HCM', 10.755, 106.67, true, 4.8 FROM Users WHERE email = 'hanghouse@gmail.com' ON CONFLICT (restaurant_id) DO NOTHING;"

%PSQL% -U postgres -h 127.0.0.1 -d %DB% -c "INSERT INTO Categories (restaurant_id, name) VALUES ((SELECT user_id FROM Users WHERE email='hanghouse@gmail.com'), 'Mì Trộn'), ((SELECT user_id FROM Users WHERE email='hanghouse@gmail.com'), 'Ăn Vặt') ON CONFLICT DO NOTHING;"

echo [END] Done. Please Restart Backend.
