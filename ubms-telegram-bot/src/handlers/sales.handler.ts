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

    const msg =
      `💰 <b>BUGUNGI SAVDO HISOBOTI</b>\n` +
      `🏢 <b>Biznes:</b> ${session.businessName || 'Do\'kon'}\n` +
      `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
      `💵 <b>Umumiy Savdo:</b> <b>${formatSum(data.todaySalesTotal || 0)}</b>\n` +
      `🧾 <b>Cheklar soni:</b> ${data.todayOrdersCount || 0} ta\n` +
      `👥 <b>Xizmat ko'rsatilgan mijozlar:</b> ${data.todayOrdersCount || 0} nafar\n` +
      `📈 <b>O'rtacha chek:</b> ${formatSum(data.todayOrdersCount ? Math.round((data.todaySalesTotal || 0) / data.todayOrdersCount) : 0)}\n\n` +
      `<i>boshqar.uz — Real vaqt hisob-kitob tizimi</i>`;

    return ctx.reply(msg, { parse_mode: 'HTML', ...getDynamicMenu(session.settings) });
  } catch (e: any) {
    return ctx.reply("❌ Savdo hisobotini olishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
  }
}
