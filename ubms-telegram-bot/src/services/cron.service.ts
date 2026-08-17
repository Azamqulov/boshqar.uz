import * as cron from 'node-cron';
import { Telegraf } from 'telegraf';
import { ApiService } from './api.service';

export function setupDailyCron(bot: Telegraf) {
  // Run every 15 minutes to check and dispatch scheduled KPI reports for businesses at their chosen times
  cron.schedule('*/15 * * * *', async () => {
    try {
      const { data } = await ApiService.dispatchDailySummaries();
      if (data?.dispatched > 0) {
        console.log(`[CRON] Dispatched ${data.dispatched} scheduled daily reports at Tashkent time.`);
      }
    } catch (e: any) {
      console.warn('[CRON] Daily summary check failed:', e?.message || e);
    }
  }, {
    timezone: 'Asia/Tashkent',
  });
}
