import { Context } from 'telegraf';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { sessionService } from '../services/session.service';

export async function handleExpense(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.token && !session?.businessId) {
    return ctx.reply("⚠️ Botdan to'liq foydalanish uchun avval akkauntingizga kiring yoki Web paneldan botni ulang.");
  }

  // Parse command arguments: /xarajat 50000 Tushlik yoki /chiqim 120000 Yoqilgi
  const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
  const parts = messageText.trim().split(/\s+/);
  
  // parts[0] is '/xarajat' or '💸 Xarajat Kiritish'
  if (parts.length >= 3) {
    const rawAmount = parts[1].replace(/[^0-9]/g, '');
    const amount = Number(rawAmount);
    const description = parts.slice(2).join(' ');

    if (!amount || amount <= 0) {
      return ctx.reply("❌ Summa noto'g'ri ko'rsatildi. Misol: <code>/xarajat 50000 Tushlik</code>", { parse_mode: 'HTML' });
    }

    try {
      const loadingMsg = await ctx.reply("⏳ Xarajat kiritilmoqda...");
      const { data } = await ApiService.createExpense(chatId, amount, description);
      const cur = data?.currency || session?.currency || 'UZS';

      if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

      return ctx.reply(
        `✅ <b>Xarajat Muvaffaqiyatli Kiritildi!</b>\n\n` +
        `💸 <b>Summa:</b> <b>${formatSum(data.amount || amount, cur)}</b>\n` +
        `📝 <b>Izoh:</b> ${description}\n` +
        `🏢 <b>Do'kon:</b> ${session.businessName || 'Boshqar.uz'}\n` +
        `📊 <b>Bugungi jami xarajat:</b> <b>${formatSum(data.todayTotalExpenses || amount, cur)}</b>\n` +
        `⏰ <b>Vaqt:</b> <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>\n\n` +
        `<i>Bu xarajat avtomatik tarzda web-tizimdagi Moliya va Kassa hisobotlariga kiritildi!</i>`,
        { parse_mode: 'HTML' }
      );
    } catch (e) {
      console.error('Error creating expense:', e);
      return ctx.reply("❌ Xarajatni kiritishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  }

  // Interactive guide if user just typed /xarajat or clicked button
  const guideText = `💸 <b>TEZKOR XARAJAT KIRITISH</b>\n\n` +
    `Xarajatni kiritish uchun buyruqdan so'ng summa va izohni yozing:\n\n` +
    `👉 <b>Namuna:</b>\n` +
    `<code>/xarajat 50000 Tushlik xarajatlari</code>\n` +
    `<code>/xarajat 120000 Yo'l kira va yetkazib berish</code>\n` +
    `<code>/xarajat 35000 Do'kon uchun choy va kofe</code>\n\n` +
    `<i>Kiritilgan barcha xarajatlar bir zumda tizim hisobotlariga qo'shiladi.</i>`;

  await ctx.reply(guideText, { parse_mode: 'HTML' });
}
