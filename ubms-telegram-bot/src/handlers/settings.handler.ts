import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { getDynamicMenu } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleSettings(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  let session = sessionService.getSession(chatId);

  // Refresh settings directly from DB
  let s = {
    notifyOnOrder: true,
    notifyDailySummary: true,
    notifyOnLowStock: true,
    notifyOnShiftClose: true,
  };

  try {
    const { data } = await ApiService.getMenuSettings(chatId);
    if (data?.isConnected && data?.businessId) {
      s = {
        notifyOnOrder: data.notifyOnOrder === true,
        notifyDailySummary: data.notifyDailySummary === true,
        notifyOnLowStock: data.notifyOnLowStock === true,
        notifyOnShiftClose: data.notifyOnShiftClose === true,
      };
      sessionService.setSession(chatId, {
        businessId: data.businessId,
        businessName: data.businessName,
        userFullName: data.ownerName,
        settings: s,
      });
      session = sessionService.getSession(chatId);
    }
  } catch (e) {}

  const msg =
    `⚙️ <b>BILDIRISHNOMA SOZLAMALARI</b>\n\n` +
    `🏢 <b>Biznes:</b> ${session?.businessName || 'Do\'kon'}\n` +
    `👤 <b>Foydalanuvchi:</b> ${session?.userFullName || 'Admin'}\n` +
    `📱 <b>Telefon:</b> ${session?.phone || 'Biriktirilgan'}\n\n` +
    `🔔 <b>Faol bo'limlar:</b>\n` +
    `• ${s.notifyOnOrder ? '✅' : '❌'} Yangi sotuv cheklari\n` +
    `• ${s.notifyDailySummary ? '✅' : '❌'} Kunlik 21:00 yakuniy hisoboti\n` +
    `• ${s.notifyOnLowStock ? '✅' : '❌'} Kam qolgan tovarlar ogohlantirishi\n` +
    `• ${s.notifyOnShiftClose ? '✅' : '❌'} Kassa smenasi yopilishi\n\n` +
    `<i>Barcha bildirishnomalarni boshqarish uchun Web Paneldagi Sozlamalar sahifasiga kiring.</i>`;

  return ctx.reply(msg, {
    parse_mode: 'HTML',
    ...(session?.businessId ? getDynamicMenu(s) : unauthenticatedKeyboard),
  });
}

export async function handleHelp(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);

  const msg =
    `ℹ️ <b>BOSHQAR.UZ BOT BUYRUQLARI</b>\n\n` +
    `💰 <b>/savdo</b> — Bugungi sotuvlar summasi va cheklar soni\n` +
    `📊 <b>/hisobot</b> — Kunlik umumiy tushum, xarajat va sof foyda\n` +
    `📦 <b>/ombor</b> — Zaxirasi kam qolgan tovarlar ro'yxati\n` +
    `🏪 <b>/kassa</b> — Kassa va smenalar holati\n` +
    `⚙️ <b>/sozlamalar</b> — Profil va bildirishnoma parametrlari\n` +
    `🚪 <b>/logout</b> — Akkauntdan chiqish\n\n` +
    `Savollar yoki yordam uchun: <b>@boshqar_support</b>`;

  return ctx.reply(msg, {
    parse_mode: 'HTML',
    ...(session?.businessId ? getDynamicMenu(session?.settings) : unauthenticatedKeyboard),
  });
}
