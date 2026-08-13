export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Majburiy environment o'zgaruvchilar topilmadi: ${missing.join(', ')}. ` +
      `.env faylni tekshiring (.env.example asosida).`
    );
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET kamida 32 belgidan iborat bo'lishi kerak.");
  }
}
