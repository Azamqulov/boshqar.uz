import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { getDynamicMenu } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleSales(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.businessId) {
    return ctx.reply(
      `⚠️ <b>Avval tizimga kiring!</b>\n\nIltimos, telefon raqamingizni yuboring:`,
      { parse_mode: 'HTML', ...unauthenticatedKeyboard }
    );
  }

  try {
    const { data } = await ApiService.getDashboardSummary(chatId);
    const cur = data?.currency || session?.currency || 'UZS';
    const isEmployee = data?.isEmployee || session.role === 'cashier' || session.role === 'employee' || session.role === 'waiter';

    let msg = '';
    if (isEmployee) {
      const shiftStatus = data.hasActiveShift ? '🟢 Ochiq (Faol)' : '⚪️ Smena ochilmagan';
      msg =
        `💰 <b>MENING BUGUNGI SAVDO HISOBOTIM</b>\n` +
        `👤 <b>Kassir / Xodim:</b> ${data.employeeName || session.userFullName || 'Kassir'}\n` +
        `🏢 <b>Biznes:</b> ${session.businessName || 'Do\'kon'}\n` +
        `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n` +
        `⏱ <b>Smena holati:</b> ${shiftStatus}\n\n` +
        `💵 <b>Shaxsiy Savdom:</b> <b>${formatSum(data.todaySalesTotal || 0, cur)}</b>\n` +
        `🧾 <b>Urgan cheklarim soni:</b> ${data.todayOrdersCount || 0} ta\n` +
        `📈 <b>O'rtacha chek:</b> ${formatSum(data.todayOrdersCount ? Math.round((data.todaySalesTotal || 0) / data.todayOrdersCount) : 0, cur)}\n\n` +
        `<i>boshqar.uz — Kassir shaxsiy hisob-kitobi</i>`;
    } else {
      msg =
        `💰 <b>BUGUNGI UMUMIY SAVDO HISOBOTI</b>\n` +
        `🏢 <b>Biznes:</b> ${session.businessName || 'Do\'kon'}\n` +
        `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
        `💵 <b>Umumiy Savdo:</b> <b>${formatSum(data.todaySalesTotal || 0, cur)}</b>\n` +
        `🧾 <b>Cheklar soni:</b> ${data.todayOrdersCount || 0} ta\n` +
        `👥 <b>Xizmat ko'rsatilgan mijozlar:</b> ${data.todayOrdersCount || 0} nafar\n` +
        `📈 <b>O'rtacha chek:</b> ${formatSum(data.todayOrdersCount ? Math.round((data.todaySalesTotal || 0) / data.todayOrdersCount) : 0, cur)}\n\n` +
        `<i>boshqar.uz — Real vaqt hisob-kitob tizimi</i>`;
    }

    return ctx.reply(msg, { parse_mode: 'HTML', ...getDynamicMenu(session.settings, session.role) });
  } catch (e: any) {
    return ctx.reply("❌ Savdo hisobotini olishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
  }
}
