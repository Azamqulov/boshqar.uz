export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Majburiy environment o'zgaruvchilar topilmadi: ${missing.join(', ')}. ` +
      `.env faylni tekshiring (.env.example asosida).`
    );
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET kamida 32 belgidan iborat bo'lishi kerak.");
  }

  const insecureKeywords = [
    'boshqar-super-secret',
    'boshqar_uz_jwt_secure',
    'default_secret',
    'secret123456',
    'jwt_secret',
    '12345678901234567890123456789012',
    'change_this_to_a_secure_jwt_key',
  ];

  if (process.env.NODE_ENV === 'production') {
    const isWeak = insecureKeywords.some((kw) => jwtSecret.toLowerCase().includes(kw));
    if (isWeak) {
      throw new Error(
        "XAVFSIZLIK XATOSI: Production muhitda ma'lum default yoki zaif JWT_SECRET ishlatilishi taqiqlangan! " +
        "Iltimos, kriptografik mustahkam, unikal JWT_SECRET o'rnating."
      );
    }
  }
}

