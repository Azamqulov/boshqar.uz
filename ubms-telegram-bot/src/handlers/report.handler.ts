import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { getDynamicMenu } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleDailyReport(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.businessId) {
    return ctx.reply(
      `⚠️ <b>Avval tizimga kiring!</b>\n\nIltimos, telefon raqamingizni yuboring:`,
      { parse_mode: 'HTML', ...unauthenticatedKeyboard }
    );
  }

  // Employee protection check
  if (session.role === 'cashier' || session.role === 'employee' || session.role === 'waiter') {
    return ctx.reply(
      `🔒 <b>Ruxsat cheklangan</b>\n\n` +
      `Do'konning umumiy moliyaviy hisoboti va sof foydasi faqat <b>Do'kon Rahbari (Admin)</b> uchun ochiq.\n\n` +
      `Siz o'z savdoingizni ko'rish uchun <b>💰 Mening Savdom</b> tugmasidan foydalanishingiz mumkin.`,
      { parse_mode: 'HTML', ...getDynamicMenu(session.settings, session.role) }
    );
  }

  try {
    const { data } = await ApiService.getDashboardSummary(chatId);
    const cur = data?.currency || session?.currency || 'UZS';

    if (data?.isEmployee) {
      return ctx.reply(
        `🔒 <b>Ruxsat cheklangan</b>\n\n` +
        `Do'konning umumiy moliyaviy hisoboti va sof foydasi faqat <b>Do'kon Rahbari (Admin)</b> uchun ochiq.\n\n` +
        `Siz o'z savdoingizni ko'rish uchun <b>💰 Mening Savdom</b> tugmasidan foydalanishingiz mumkin.`,
        { parse_mode: 'HTML', ...getDynamicMenu(session.settings, session.role) }
      );
    }

    const msg =
      `📊 <b>KUNLIK YAKUNIY HISOBOT (KPI)</b>\n` +
      `🏢 <b>Biznes:</b> ${session.businessName || 'Do\'kon'}\n` +
      `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
      `🟢 <b>Kirim (Savdo):</b> ${formatSum(data.todaySalesTotal || 0, cur)}\n` +
      `🔴 <b>Chiqim (Xarajatlar):</b> ${formatSum(data.todayExpensesTotal || 0, cur)}\n` +
      `💎 <b>Sof Foyda:</b> <b>${formatSum(data.todayNetProfit || ((data.todaySalesTotal || 0) - (data.todayExpensesTotal || 0)), cur)}</b>\n\n` +
      `🧾 <b>Cheklar soni:</b> ${data.todayOrdersCount || 0} ta\n` +
      `👥 <b>Yangi mijozlar:</b> ${data.newCustomersCount || 0} ta\n` +
      `📦 <b>Kam qolgan tovarlar:</b> ${data.lowStockItemsCount || 0} ta\n\n` +
      `<i>boshqar.uz — Tizimli biznes boshqaruvi</i>`;

    return ctx.reply(msg, { parse_mode: 'HTML', ...getDynamicMenu(session.settings, session.role) });
  } catch (e: any) {
    return ctx.reply("❌ Hisobotni yuklashda xatolik yuz berdi.");
  }
}
