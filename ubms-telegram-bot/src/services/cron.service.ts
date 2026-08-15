import * as cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { sessionService } from './session.service';
import { ApiService } from './api.service';
import { formatSum } from '../utils/formatters';

export function setupDailyCron(bot: Telegraf) {
  // Run everyday at 21:00 Tashkent time
  cron.schedule('0 21 * * *', async () => {
    console.log('[CRON] Running 21:00 Daily KPI Summary Dispatch...');
    const allSessions = sessionService.getAllSessions();

    for (const [chatId, session] of allSessions.entries()) {
      if (!session.token || !session.businessId) continue;

      try {
        const { data } = await ApiService.getDashboardSummary(chatId);

        const msg =
          `🔔 <b>KUNLIK YAKUNIY HISOBOT (21:00)</b>\n` +
          `🏢 <b>Biznes:</b> ${session.businessName || 'Do\'kon'}\n` +
          `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
          `💰 <b>Kirim (Savdo):</b> ${formatSum(data.todaySalesTotal || 0)}\n` +
          `💸 <b>Chiqim (Xarajat):</b> ${formatSum(data.todayExpensesTotal || 0)}\n` +
          `💎 <b>Sof Foyda:</b> <b>${formatSum(data.todayNetProfit || ((data.todaySalesTotal || 0) - (data.todayExpensesTotal || 0)))}</b>\n\n` +
          `🧾 <b>Cheklar soni:</b> ${data.todayOrdersCount || 0} ta\n` +
          `👥 <b>Yangi mijozlar:</b> ${data.newCustomersCount || 0} ta\n` +
          `📦 <b>Kam qolgan tovarlar:</b> ${data.lowStockItemsCount || 0} ta\n\n` +
          `<i>boshqar.uz — Tizimli biznes boshqaruvi</i>`;

        await bot.telegram.sendMessage(chatId, msg, { parse_mode: 'HTML' });
      } catch (e) {
        console.warn(`[CRON] Failed to send summary to chatId ${chatId}`);
      }
    }
  }, {
    timezone: 'Asia/Tashkent',
  });
}
