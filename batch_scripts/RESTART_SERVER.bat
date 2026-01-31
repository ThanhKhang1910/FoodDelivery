@echo off
echo --- RESTARTING BACKEND SERVER ---
echo 1. Stopping ALL old node processes (this might close other windows)...
echo    If this fails, don't worry.
taskkill /F /IM node.exe /T 2>nul
echo.
echo 2. STARTING SERVER ON PORT 5005...
echo ========================================================
echo !!! IMPORTANT: DO NOT CLOSE THIS BLACK WINDOW !!!
echo !!! IMPORTANT: DO NOT CLOSE THIS BLACK WINDOW !!!
echo !!! IMPORTANT: DO NOT CLOSE THIS BLACK WINDOW !!!
echo ========================================================
echo.
node server.js
pause
