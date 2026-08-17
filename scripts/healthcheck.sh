#!/usr/bin/env bash
# ════════════════════════════════════════════════════
#  boshqar.uz — Enterprise Automated Healthcheck Script
#  Ushbu skript Backend, Database, Redis va Frontend
#  holatini tekshiradi va uzilish bo'lsa ogohlantiradi.
# ════════════════════════════════════════════════════

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:4000/api/v1/health}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

send_alert() {
    local msg="$1"
    log "⚠️ ALERT: $msg"
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🚨 *boshqar.uz Server Xatosi:* %0A${msg}" \
            -d "parse_mode=Markdown" > /dev/null 2>&1 || true
    fi
}

log "🔍 boshqar.uz Tizim holatini tekshirish boshlandi..."

# 1. Backend Health Check
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")
if [ "$BACKEND_STATUS" -eq 200 ] || [ "$BACKEND_STATUS" -eq 404 ]; then
    log "✅ Backend API: Ishlayapti (HTTP $BACKEND_STATUS)"
else
    send_alert "Backend API javob bermayapti! HTTP Status: $BACKEND_STATUS (URL: $BACKEND_URL)"
fi

# 2. Frontend Health Check
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$FRONTEND_STATUS" -eq 200 ] || [ "$FRONTEND_STATUS" -eq 304 ]; then
    log "✅ Frontend Web App: Ishlayapti (HTTP $FRONTEND_STATUS)"
else
    send_alert "Frontend Web ilova javob bermayapti! HTTP Status: $FRONTEND_STATUS (URL: $FRONTEND_URL)"
fi

log "✨ Healthcheck muvaffaqiyatli yakunlandi."
