# 🚨 Boshqar.uz — Falokatdan Qayta Tiklash Rejasi (Disaster Recovery Runbook)

Ushbu hujjat server to'xtab qolishi, ma'lumotlar bazasi shikastlanishi yoki server buzilishi holatlarida tizimni **5–15 daqiqa ichida** to'liq qayta tiklash bo'yicha qadam-baqadam ko'rsatmadir.

---

## 1. ⏱ RTO va RPO Ko'rsatkichlari
- **RTO (Recovery Time Objective):** Maksimal 15 daqiqa (tizimni yangi serverda ko'tarish vaqti).
- **RPO (Recovery Point Objective):** Maksimal 24 soat (so'nggi avtomatik backup vaqti).

---

## 2. 🔄 PostgreSQL Ma'lumotlar Bazasini Qayta Tiklash (Restore)

### A) So'nggi Zaxiradan Tiklash (Linux / Docker):
```bash
# 1. Mavjud zaxira fayllarini ko'rish
ls -la /var/backups/boshqar-db/

# 2. Yangi/toza bazaga zaxirani yuklash (masalan boshqar_backup_20260817_120000.sql.gz)
gunzip -c /var/backups/boshqar-db/boshqar_backup_20260817_120000.sql.gz | psql -U postgres -d ubms_db
```

### B) Docker Volume Orqali Tiklash:
```bash
# Docker konteynerlari to'xtatilib, yangi dump orqali ko'tariladi
docker compose down
docker compose up -d postgres
cat /var/backups/boshqar-db/latest.sql | docker exec -i boshqar_postgres psql -U postgres -d ubms_db
docker compose up -d
```

---

## 3. 🚀 Yangi Serverda Tizimni Noldan Ko'tarish (Zero to Production)

1. **Repozitoriyni klonlash:**
   ```bash
   git clone https://github.com/Azamqulov/boshqar.uz.git /var/www/boshqar.uz
   cd /var/www/boshqar.uz
   ```

2. **Atrof-muhit o'zgaruvchilarini (`.env`) o'rnatish:**
   ```bash
   cp ubms-backend/.env.example ubms-backend/.env
   # DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN larni kiritish
   ```

3. **Backend va Frontendni ishga tushirish:**
   ```bash
   # Docker orqali
   docker compose up -d --build

   # Yoki to'g'ridan-to'g'ri PM2 orqali
   cd ubms-backend && npm ci && npx prisma migrate deploy && npm run build
   pm2 start dist/src/main.js --name "boshqar-backend"
   ```

4. **Monitoring va Sog'liq Tekshiruvi:**
   ```bash
   curl http://localhost:4000/api/v1/health
   # Status: "ok" bo'lishi shart
   ```

---

## 4. 📞 Favqulodda Aloqa va Rollar
- **Bosh Muhandis (Lead):** +998 77 040 46 24 / Telegram: `@Boshqar_uzbot`
- **Infratuzilma (DevOps):** `admin@boshqar.uz`
