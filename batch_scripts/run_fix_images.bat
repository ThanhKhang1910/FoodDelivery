@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Fixing image links for Hằng House...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f fix_images.sql

echo.
echo [INFO] DONE! Images updated to stable sources.
echo Please refresh your browser.
pause
