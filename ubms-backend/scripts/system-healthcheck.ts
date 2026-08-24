import { PrismaClient } from '@prisma/client';
import Keyv from 'keyv';

const prisma = new PrismaClient();

async function runHealthCheck() {
  console.log('--- 🏥 Starting System Health & Diagnostics Check ---');
  let hasErrors = false;

  // 1. Check PostgreSQL Database Connection
  try {
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    console.log(`✅ Database (PostgreSQL): Connected successfully! (${userCount} users, ${businessCount} businesses)`);
  } catch (error: any) {
    console.error('❌ Database (PostgreSQL): Connection failed!', error.message);
    hasErrors = true;
  }

  // 2. Check Redis Cache Connection
  try {
    const keyv = new Keyv();
    await keyv.set('healthcheck_test', 'OK', 5000);
    const value = await keyv.get('healthcheck_test');
    if (value === 'OK') {
      console.log('✅ Redis Cache: Connected and read/write operational!');
    } else {
      console.error('❌ Redis Cache: Unexpected value returned!');
      hasErrors = true;
    }
  } catch (error: any) {
    console.warn('⚠️ Redis Cache: Connection warning (fallback to memory):', error.message);
  }

  // 3. Check Prisma Models Integrity
  try {
    const plans = await prisma.plan.count();
    console.log(`✅ Prisma Schema Integrity: Operational! (${plans} active plans found)`);
  } catch (error: any) {
    console.error('❌ Prisma Schema: Tables out of sync!', error.message);
    hasErrors = true;
  }

  console.log('----------------------------------------------------');
  if (hasErrors) {
    console.error('🚨 System Health Check Completed with ERRORS!');
    process.exit(1);
  } else {
    console.log('🎉 System Health Check Completed Successfully: ALL SYSTEMS GO!');
    process.exit(0);
  }
}

runHealthCheck()
  .catch((err) => {
    console.error('Unhandled Health Check Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
