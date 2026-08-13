import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import axios from 'axios';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const API_URL = process.env.API_URL || 'http://localhost:4000/api/v1';

const bot = new Telegraf(BOT_TOKEN);

// In-memory linked business storage (In prod: save to DB / Redis)
const linkedBusinesses = new Map<number, { businessId: string; branchId?: string }>();

bot.start((ctx) => {
  const payload = ctx.message.text.split(' ')[1];
  if (payload) {
    linkedBusinesses.set(ctx.from.id, { businessId: payload });
    return ctx.reply(`✅ Tabriklaymiz! Biznesingiz muvaffaqiyatli ulandi (ID: ${payload}).\n\nBuyruqlar:\n/kpi — Bugungi umumiy ko'rsatkichlar\n/savdo — Bugungi sotuvlar summasi\n/ombor — Kam qolgan tovarlar`);
  }
  ctx.reply("👋 Assalomu alaykum! boshqar.uz (UBMS) botiga xush kelibsiz.\n\nBotni biznesingizga ulash uchun boshqaruv panelidagi havoladan foydalaning.");
});

bot.command('kpi', async (ctx) => {
  const linked = linkedBusinesses.get(ctx.from.id);
  if (!linked) {
    return ctx.reply("⚠️ Siz hali hech qaysi biznesni ulamagansiz. Web panel orqali botni ulang.");
  }

  try {
    const { data } = await axios.get(`${API_URL}/dashboard/summary`, {
      headers: { 'x-business-id': linked.businessId },
    });

    const msg = `📊 *Bugungi KPI ko'rsatkichlari:*\n\n` +
      `💰 *Savdo:* ${data.todaySales.toLocaleString()} so'm\n` +
      `📉 *Xarajat:* ${data.todayExpenses.toLocaleString()} so'm\n` +
      `📈 *Sof Foyda:* ${data.todayProfit.toLocaleString()} so'm\n` +
      `🛒 *Cheklar soni:* ${data.todayOrdersCount} ta\n` +
      `📦 *Kam qolgan tovarlar:* ${data.lowStockItemsCount} ta`;

    ctx.replyWithMarkdown(msg);
  } catch (err) {
    ctx.reply("❌ Ma'lumotlarni yuklashda xatolik yuz berdi.");
  }
});

// Daily automatic 21:00 cron summary report
cron.schedule('0 21 * * *', async () => {
  console.log('Running daily 21:00 summary broadcast...');
  for (const [chatId, linked] of linkedBusinesses.entries()) {
    try {
      const { data } = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: { 'x-business-id': linked.businessId },
      });

      const msg = `🌙 *Kunlik Yakuniy Hisobot (21:00):*\n\n` +
        `💰 *Bugungi Jami Savdo:* ${data.todaySales.toLocaleString()} so'm\n` +
        `📈 *Sof Foyda:* ${data.todayProfit.toLocaleString()} so'm\n` +
        `🛒 *Cheklar:* ${data.todayOrdersCount} ta\n` +
        `👥 *Yangi mijozlar:* ${data.newCustomersCount} ta\n\n` +
        `boshqar.uz — Biznesingiz doim nazoratda!`;

      await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(`Failed to send daily summary to ${chatId}`, e);
    }
  }
});

if (process.env.BOT_TOKEN) {
  bot.launch().then(() => {
    console.log('🤖 UBMS Telegram Bot muvaffaqiyatli ishga tushdi');
  });
} else {
  console.log('ℹ️ BOT_TOKEN berilmagan, bot server rejimida tayyor turibdi');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
