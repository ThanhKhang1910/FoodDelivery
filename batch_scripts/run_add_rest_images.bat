@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Adding image capability to Restaurants and updating photos...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f add_restaurant_images.sql

echo.
echo [INFO] DONE! All 5 restaurants now have beautiful photos.
echo Please refresh your browser (F5).
pause
