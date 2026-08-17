import { Context } from 'telegraf';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { sessionService } from '../services/session.service';

export async function handleCashiers(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.token && !session?.businessId) {
    return ctx.reply("⚠️ Botdan to'liq foydalanish uchun avval akkauntingizga kiring yoki Web paneldan botni ulang.");
  }

  const isCashier = session.role === 'cashier' || session.role === 'employee' || session.role === 'waiter';

  try {
    const loadingMsg = await ctx.reply(isCashier ? "⏳ Smena ma'lumotlari yuklanmoqda..." : "⏳ Kassirlar va smena ma'lumotlari yuklanmoqda...");
    
    if (isCashier) {
      const { data } = await ApiService.getDashboardSummary(chatId);
      const cur = data?.currency || session?.currency || 'UZS';
      const shiftBadge = data.hasActiveShift ? '🟢 <b>Ochiq (Faol smena)</b>' : '⚪️ <i>Smena yopiq yoki ochilmagan</i>';

      const message = `👤 <b>MENING SMENAM HOLATI</b>\n` +
        `🏢 <b>Do'kon:</b> ${session.businessName || 'Boshqar.uz'}\n` +
        `👤 <b>Kassir:</b> ${data.employeeName || session.userFullName || 'Kassir'}\n` +
        `⏱ <b>Holat:</b> ${shiftBadge}\n` +
        `───────────────\n` +
        `💰 <b>Bugungi shaxsiy savdom:</b> <b>${formatSum(data.todaySalesTotal || 0, cur)}</b>\n` +
        `🧾 <b>Urgan cheklarim soni:</b> <b>${data.todayOrdersCount || 0} ta</b>\n` +
        `📈 <b>O'rtacha chek:</b> ${formatSum(data.todayOrdersCount ? Math.round((data.todaySalesTotal || 0) / data.todayOrdersCount) : 0, cur)}\n\n` +
        `⏰ <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>`;

      if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
      return ctx.reply(message, { parse_mode: 'HTML' });
    }

    const { data } = await ApiService.getCashiers(chatId);
    const cur = data?.currency || session?.currency || 'UZS';

    const openShiftsCount = data.openShiftsCount || 0;
    const cashiers: any[] = data.cashiers || [];

    let listText = '';
    if (cashiers.length === 0) {
      listText = "<i>Xodimlar ro'yxati topilmadi.</i>";
    } else {
      listText = cashiers.map((c, index) => {
        const shiftBadge = c.isShiftOpen ? '🟢 <b>Smenada (Faol)</b>' : '⚪️ <i>Smena yopiq</i>';
        return `<b>${index + 1}. 👤 ${c.name}</b> (${c.role})\n` +
          `   Holat: ${shiftBadge}\n` +
          `   🧾 Bugungi cheklar: <b>${c.todaySalesCount} ta</b>\n` +
          `   💰 Jami savdosi: <b>${formatSum(c.todayTotalSales, cur)}</b>`;
      }).join('\n\n');
    }

    const message = `🏪 <b>KASSIRLAR VA SMENA NAZORATI</b>\n` +
      `🏢 <b>Do'kon:</b> ${session.businessName || 'Boshqar.uz'}\n\n` +
      `🟢 <b>Ochiq Smenalar:</b> <b>${openShiftsCount} ta</b>\n` +
      `───────────────\n` +
      `${listText}\n\n` +
      `⏰ <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>`;

    if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (e) {
    console.error('Error fetching cashiers:', e);
    ctx.reply("❌ Kassirlar ma'lumotlarini olishda xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}
