@echo off
set PGPASSWORD=123456
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set LOG=setup_log.txt

echo [START] Setup started at %TIME% > %LOG%

echo 1. Creating Database... >> %LOG%
%PSQL% -U postgres -h 127.0.0.1 -c "CREATE DATABASE food_ordering_db;" >> %LOG% 2>&1

echo 2. Applying Schema... >> %LOG%
%PSQL% -U postgres -h 127.0.0.1 -d food_ordering_db -f database_schema.sql >> %LOG% 2>&1

echo 3. Seeding Data... >> %LOG%
%PSQL% -U postgres -h 127.0.0.1 -d food_ordering_db -f seed_data.sql >> %LOG% 2>&1

echo [END] Finished at %TIME% >> %LOG%
