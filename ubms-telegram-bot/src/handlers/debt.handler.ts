import { Context } from 'telegraf';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { sessionService } from '../services/session.service';

export async function handleDebts(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.token && !session?.businessId) {
    return ctx.reply("⚠️ Botdan to'liq foydalanish uchun avval akkauntingizga kiring yoki Web paneldan botni ulang.");
  }

  try {
    const loadingMsg = await ctx.reply("⏳ Nasiyalar va qarzdorlar ro'yxati yuklanmoqda...");

    const { data } = await ApiService.getDebts(chatId);
    const cur = data?.currency || session?.currency || 'UZS';

    const totalDebt = data.totalDebt || 0;
    const debtorsCount = data.debtorsCount || 0;
    const customers: any[] = data.customers || [];

    if (debtorsCount === 0 || customers.length === 0) {
      if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
      return ctx.reply(
        `🎉 <b>Qarzdorlik yo'q!</b>\n\n` +
        `Sizning do'koningizda ayni paytda faol nasiya yoki qarzdor mijozlar mavjud emas. Barcha hisoblar toza! 👏`,
        { parse_mode: 'HTML' }
      );
    }

    let customerListText = customers
      .slice(0, 10)
      .map((c, index) => {
        const lastDate = c.lastPurchaseAt ? new Date(c.lastPurchaseAt).toLocaleDateString('uz-UZ') : "Noma'lum";
        return `<b>${index + 1}. ${c.name}</b>\n` +
               `   📞 <code>${c.phone}</code>\n` +
               `   🔴 Qarz: <b>${formatSum(c.debt, cur)}</b>\n` +
               `   📅 Oxirgi xarid: <i>${lastDate}</i>`;
      })
      .join('\n\n');

    if (customers.length > 10) {
      customerListText += `\n\n<i>...va yana ${customers.length - 10} ta qarzdor mijoz (Web-panelda to'liq ro'yxat)</i>`;
    }

    const message = `💳 <b>NASIYA VA QARZDORLIK HISOBOTI</b>\n` +
      `🏢 <b>Do'kon:</b> ${session.businessName || 'Boshqar.uz'}\n\n` +
      `📊 <b>Umumiy Qarzdorlik:</b> <b>${formatSum(totalDebt, cur)}</b>\n` +
      `👥 <b>Qarzdorlar soni:</b> <b>${debtorsCount} ta mijoz</b>\n\n` +
      `───────────────\n` +
      `📋 <b>Asosiy Qarzdorlar:</b>\n\n` +
      `${customerListText}\n\n` +
      `💡 <i>Mijozga eslatma yuborish uchun pastdagi tugmani bosing yoki Web-panelga kiring.</i>`;

    if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📲 Qarz Eslatmasi Matni Olish", callback_data: 'debt_reminder_template' }
          ]
        ]
      }
    });
  } catch (error: any) {
    console.error('Error in handleDebts:', error);
    ctx.reply("❌ Nasiyalar ma'lumotlarini yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}

export async function handleDebtReminderTemplate(ctx: any) {
  await ctx.answerCbQuery().catch(() => {});
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  const storeName = session?.businessName || "Do'konimiz";

  const template = `📝 <b>Mijozlarga Qarz Eslatmasi Namuna Matni:</b>\n\n` +
    `<code>Assalomu alaykum, hurmatli mijoz! "${storeName}" dan xarid qilgan tovarlaringiz bo'yicha hisob-kitob qilish vaqti kelganini eslatib o'tamiz. Iltimos, qulay vaqtingizda to'lovni amalga oshirishingizni so'raymiz. Xaridingiz uchun rahmat!</code>\n\n` +
    `<i>Ushbu matndan nusxa olib, mijozning Telegram yoki SMS raqamiga yuborishingiz mumkin.</i>`;

  await ctx.reply(template, { parse_mode: 'HTML' });
}
