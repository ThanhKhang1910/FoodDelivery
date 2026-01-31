@echo off
set PGPASSWORD=123456
echo [INFO] Creating Database food_ordering_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE food_ordering_db;"

echo.
echo [INFO] Listing Databases to verify:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -l | findstr food_ordering_db

echo.
echo [INFO] Applying Schema...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d food_ordering_db -f database_schema.sql

echo.
echo [INFO] Done.
