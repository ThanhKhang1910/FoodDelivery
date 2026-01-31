@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Setting up Rides table and seeding drivers...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f setup_rides.sql

echo.
echo [INFO] DONE! Database is ready for Bike/Car Rides.
pause
