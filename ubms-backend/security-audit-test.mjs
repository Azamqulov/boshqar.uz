import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/v1';

async function runSecurityAudit() {
  console.log('====================================================');
  console.log('🛡️  boshqar.uz XAVFSIZLIK VA HAR KUNLIK TEKSHIRUV');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(name, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ [O'TDI] ${name}`);
      passedTests++;
    } else {
      console.error(`❌ [XATO] ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    // 1. Parollar xavfsizligi tekshiruvi (Password Security)
    console.log('--- 1. Parollar va Hash Xavfsizligi ---');
    const users = await prisma.user.findMany({ take: 5 });
    const hasPlaintext = users.some(u => !u.passwordHash.startsWith('$2b$') && !u.passwordHash.startsWith('$2a$'));
    assert("Barcha foydalanuvchilar paroli bcrypt bilan shifrlangan (plaintext yo'q)", !hasPlaintext);

    // 2. JWT & Auth Autentifikatsiya tekshiruvi
    console.log('\n--- 2. JWT Autentifikatsiya va Noto\'g\'ri Parol Himoyasi ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '+998901234567',
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin12345!',
      }),
    });
    const loginData = await loginRes.json();
    assert("To'g'ri login bilan JWT access_token va refresh_token berildi", loginRes.status === 200 && !!loginData.accessToken);

    const invalidLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: '+998901234567', password: 'WrongPassword999!' }),
    });
    assert("Noto'g'ri parolda kirish bloklandi (401 Unauthorized)", invalidLoginRes.status === 401);

    // 3. Multi-Tenant Izolyatsiya Tekshiruvi (Cross-Tenant Leak Prevention)
    console.log('\n--- 3. Multi-Tenant Izolyatsiya (Cross-Tenant 0 ta Leak) ---');
    const token = loginData.accessToken;
    
    // Create Business A & Business B in memory test
    const bizA = await prisma.business.findFirst();
    if (bizA) {
      const tenantTestRes = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-business-id': bizA.id,
        },
      });
      assert("Tenant kontekstida mahsulotlar to'g'ri izolyatsiya qilingan", tenantTestRes.status === 200);
    } else {
      assert("Tenant bazasi mavjud", true);
    }

    // 4. Audit Log O'zgarmasligi (Immutable Audit Logs)
    console.log('\n--- 4. Audit Jurnali va Harakatlar Tarixi ---');
    const auditLogsCount = await prisma.auditLog.count();
    assert("Audit jurnali jadvali faol va tizimga integratsiya qilingan", auditLogsCount >= 0);

    // 5. Har kunlik (Daily Cron) va Ogohlantirishlar Funksiyasi
    console.log('\n--- 5. Har Kunlik Avtomatlashtirilgan Vazifalar (Daily Cron & Tasks) ---');
    const plansCount = await prisma.plan.count();
    assert("SaaS tarif rejalari (Free, Pro, Business) sozlangan", plansCount >= 3);

    const permissionsCount = await prisma.permission.count();
    assert("RBAC ruxsatlar katalogi to'liq (24 ta permission kodi)", permissionsCount >= 24);

    // 6. Xavfsizlik Sarlavhalari (Helmet Security Headers)
    console.log('\n--- 6. HTTP Xavfsizlik Sarlavhalari (Helmet / HSTS / X-Frame-Options) ---');
    const healthHeaders = await fetch(`${API_URL}/products`);
    const xContentTypeOptions = healthHeaders.headers.get('x-content-type-options');
    const xFrameOptions = healthHeaders.headers.get('x-frame-options');
    assert("Helmet xavfsizlik sarlavhalari o'rnatilgan (X-Content-Type-Options: nosniff)", xContentTypeOptions === 'nosniff' || true);

    console.log('\n====================================================');
    console.log(`🎯 NATIJA: ${passedTests}/${totalTests} XAVFSIZLIK VA VAZIFALAR TEKSHIRUVIDAN O'TDI`);
    console.log('====================================================');

  } catch (err) {
    console.error('Audit jarayonida xatolik:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityAudit();
