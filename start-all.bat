@echo off
title boshqar.uz Full Suite Launcher
echo ==================================================
echo   boshqar.uz — Tizimni Ishga Tushirish (Full Suite)
echo ==================================================
echo 1. Backend:      http://localhost:4000
echo 2. Frontend:     http://localhost:5173
echo 3. Telegram Bot: @Boshqar_uzbot
echo ==================================================
start "Boshqar Backend" cmd /k "cd ubms-backend && npm run start:dev"
start "Boshqar Frontend" cmd /k "cd ubms-frontend && npm run dev"
start "Boshqar Telegram Bot" cmd /k "cd ubms-telegram-bot && npm run dev"
echo Barcha xizmatlar ishga tushirildi!
