@echo off
chcp 65001 > nul
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=food_ordering_db

echo [INFO] Fixing Font Encoding...
%PSQL% -U postgres -h 127.0.0.1 -d %DB% -f fix_encoding.sql

echo [INFO] Done. Please check the website.
pause
