# 🛡️ boshqar.uz — Favqulodda Tiklanish (Disaster Recovery) va SLA Rejasi

Ushbu hujjat kutilmagan texnik avariyalar, ma'lumotlar bazasi shikastlanishi yoki server uzilishlarida tizimni zudlik bilan tiklash tartibini belgilaydi.

---

## 1. SLA va Tiklanish Ko'rsatkichlari

- **Kutilgan Uptime:** 99.8% (oyiga ruxsat etilgan maksimal rejasiz uzilish: < 1.4 soat).
- **RTO (Recovery Time Objective):** < 15 daqiqa (server to'xtab qolganda yangi muhitda ko'tarish vaqti).
- **RPO (Recovery Point Objective):** < 1 soat (avariya holatida yo'qotilishi mumkin bo'lgan maksimal ma'lumotlar oralig'i).

---

## 2. Zaxira Nusxalash (Backup Strategy)

1. **Avtomatlashtirilgan Kundalik Backup:**
   - Har kuni soat 03:00 da `scripts/backup-database.sh` skripti orqali PostgreSQL bazasi to'liq dump qilinadi va gzip bilan siqiladi.
   - Saqlash muddati (Retention Policy): oxirgi 14 kunlik zaxiralar saqlanadi, eskilari avtomatik tozalanadi.
2. **Off-site Zaxira:**
   - Zaxira nusxalari AWS S3 yoki Cloudflare R2 tashqi shifrlangan saqlagichiga sinxronlashtiriladi.

---

## 3. Qayta Tiklash Tartibi (Step-by-Step Recovery)

1. **Yangi serverda PostgreSQL ko'tarish:**
   ```bash
   docker run -d --name boshqar-postgres -e POSTGRES_PASSWORD=secure_pass -p 5432:5432 postgres:16
   ```
2. **Dump faylni tiklash:**
   ```bash
   gunzip < backup_boshqar_2026-08-17.sql.gz | psql -U postgres -h localhost -d postgres
   ```
3. **Ilovani qayta ishga tushirish:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
4. **Healthcheck orqali tekshirish:**
   ```bash
   bash scripts/healthcheck.sh
   ```
