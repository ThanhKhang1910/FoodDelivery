@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Adding 3 New Restaurants and Menus...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f add_more_restaurants.sql

echo.
echo [INFO] DONE! Burger House, Pizza Italiano, and Phở & Bún Việt have been added.
echo Please go to the website and refresh (F5).
pause
