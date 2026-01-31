@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Repairing Hang House Menu Items...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f final_hang_house_fix.sql

echo.
echo [INFO] DONE! All dishes and categories have been re-linked.
echo Please go to the website and refresh (F5).
pause
