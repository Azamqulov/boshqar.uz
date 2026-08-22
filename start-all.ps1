# Boshqar.uz - Barcha xizmatlarni bir vaqtda ishga tushirish skripti
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 boshqar.uz — Tizimni Ishga Tushirish (Full Suite)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Backend:      http://localhost:4000 (Swagger: /api/docs)" -ForegroundColor Yellow
Write-Host "2. Frontend:     http://localhost:5173" -ForegroundColor Yellow
Write-Host "3. Telegram Bot: @Boshqar_uzbot (Faol)" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$backend = Start-Process -FilePath "npm" -ArgumentList "run", "start:dev" -WorkingDirectory "$PSScriptRoot\ubms-backend" -PassThru
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\ubms-frontend" -PassThru
$bot = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\ubms-telegram-bot" -PassThru

Write-Host "✅ Barcha 3 ta xizmat ishga tushirildi!" -ForegroundColor Green
Write-Host "To'xtatish uchun: Ctrl + C yoki oynalarni yoping." -ForegroundColor Gray

Wait-Process -Id $backend.Id, $frontend.Id, $bot.Id
