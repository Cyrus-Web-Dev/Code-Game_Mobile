@echo off
REM ============================================================
REM  Kode Tebak Mobile - perbaikan instalasi (jalankan di folder proyek)
REM  Memperbaiki: "Cannot find module 'babel-preset-expo'" dan
REM  "Cannot read properties of undefined (reading 'transformFile')"
REM ============================================================
cd /d "%~dp0"

echo [1/6] Hapus node_modules, lockfile, cache lama...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist .expo rmdir /s /q .expo
call npm cache verify

echo [2/6] Pasang ulang semua paket (peer-deps longgar agar tidak ERESOLVE)...
call npm install 
if errorlevel 1 goto :fail

echo [3/6] Samakan semua paket Expo dengan versi SDK yang terpasang...
call npx expo install --fix
if errorlevel 1 goto :fail

echo [4/6] Pasang babel-preset-expo di level atas (inilah yang hilang)...
call npx expo install babel-preset-expo
if errorlevel 1 goto :fail

echo [5/6] Cek kesehatan proyek...
call npx expo-doctor
call npm run typecheck
call npm run test:engine

echo [6/6] Jalankan Metro dengan cache bersih...
call npx expo start -c
goto :eof

:fail
echo.
echo *** Langkah gagal. Salin pesan error di atas dan kirim ke saya. ***
pause
