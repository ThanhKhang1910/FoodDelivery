@echo off
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set LOG=data_check.txt

echo [CHECK] Started at %TIME% > %LOG%

echo 1. Checking Restaurants... >> %LOG%
%PSQL% -U postgres -h 127.0.0.1 -d food_ordering_db -c "SELECT restaurant_id, shop_name, is_open FROM Restaurants;" >> %LOG% 2>&1

echo 2. Checking Categories for Hằng House... >> %LOG%
%PSQL% -U postgres -h 127.0.0.1 -d food_ordering_db -c "SELECT * FROM Categories;" >> %LOG% 2>&1

echo [END] Finished. >> %LOG%
