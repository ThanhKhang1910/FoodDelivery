@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Updating database for Car Tiers (Standard, Business, Limo)...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f setup_car_tiers.sql

echo.
echo [INFO] DONE! Database updated with new Car Tiers and Drivers.
pause
