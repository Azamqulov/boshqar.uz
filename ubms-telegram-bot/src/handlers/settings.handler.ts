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
  let s: Record<string, any> = {
    notifyOnOrder: true,
    notifyDailySummary: true,
    dailySummaryTime: '21:00',
    notifyOnLowStock: true,
    notifyOnShiftClose: true,
    allowDebtsInBot: true,
    allowExpenseInBot: true,
    allowProductSearch: true,
    allowCashierControl: true,
  };
  let currency = session?.currency || 'UZS';
  let phone = session?.phone || '';

  try {
    const { data } = await ApiService.getMenuSettings(chatId);
    if (data?.isConnected && data?.businessId) {
      s = {
        notifyOnOrder: data.notifyOnOrder !== false,
        notifyDailySummary: data.notifyDailySummary !== false,
        dailySummaryTime: data.dailySummaryTime || '21:00',
        notifyOnShiftClose: data.notifyOnShiftClose !== false,
        notifyOnLowStock: data.notifyOnLowStock !== false,
        allowDebtsInBot: data.allowDebtsInBot !== false,
        allowExpenseInBot: data.allowExpenseInBot !== false,
        allowProductSearch: data.allowProductSearch !== false,
        allowCashierControl: data.allowCashierControl !== false,
      };
      currency = data.currency || 'UZS';
      if (data.ownerPhone) phone = data.ownerPhone;

      sessionService.setSession(chatId, {
        businessId: data.businessId,
        businessName: data.businessName,
        userFullName: data.ownerName,
        phone: phone || session?.phone,
        currency,
        settings: s,
      });
      session = sessionService.getSession(chatId);
    }
  } catch (e) {}

  const currencyLabels: Record<string, string> = {
    UZS: "UZS (so'm)",
    USD: "USD ($)",
    RUB: "RUB (₽)",
    EUR: "EUR (€)",
    KZT: "KZT (₸)",
  };
  const curLabel = currencyLabels[currency.toUpperCase()] || currency;

  const msg =
    `⚙️ <b>SOZLAMALAR VA BOG'LANISH</b>\n\n` +
    `🏢 <b>Biznes:</b> ${session?.businessName || 'Do\'kon'}\n` +
    `👤 <b>Foydalanuvchi:</b> ${session?.userFullName || 'Admin'}\n` +
    (session?.phone ? `📱 <b>Telefon:</b> ${session.phone}\n` : '') +
    `💵 <b>Asosiy valyuta:</b> <b>${curLabel}</b>\n\n` +
    `🔔 <b>Bildirishnomalar:</b>\n` +
    `• ${s.notifyOnOrder ? '✅' : '❌'} Yangi sotuv cheklari\n` +
    `• ${s.notifyDailySummary ? '✅' : '❌'} Kunlik (${s.dailySummaryTime || '21:00'}) yakuniy hisoboti\n` +
    `• ${s.notifyOnLowStock ? '✅' : '❌'} Kam qolgan tovarlar ogohlantirishi\n` +
    `• ${s.notifyOnShiftClose ? '✅' : '❌'} Kassa smenasi yopilishi\n\n` +
    `⚡️ <b>Bot funksiyalari va bo'limlari:</b>\n` +
    `• ${s.allowDebtsInBot ? '✅' : '❌'} Nasiya va qarzdorlik hisoboti (/nasiya)\n` +
    `• ${s.allowExpenseInBot ? '✅' : '❌'} Tezkor xarajat kiritish (/xarajat)\n` +
    `• ${s.allowProductSearch ? '✅' : '❌'} Tovar va narx qidiruvi (/narx)\n` +
    `• ${s.allowCashierControl ? '✅' : '❌'} Kassirlar va smena nazorati (/kassirlar)\n\n` +
    `<i>Barcha sozlamalarni o'zgartirish uchun Web Paneldagi <b>Sozlamalar -> Telegram Bot</b> sahifasiga kiring.</i>`;

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
    `📊 <b>/hisobot</b> — Kunlik tushum, xarajat va sof foyda\n` +
    `💳 <b>/nasiya</b> yoki <b>/qarz</b> — Qarzdor mijozlar ro'yxati va umumiy nasiya\n` +
    `💸 <b>/xarajat 50000 Tushlik</b> — Telegram orqali tezkor xarajat kiritish\n` +
    `🔍 <b>/narx Cola</b> — Tovar qoldig'i, tannarxi va sotuv narxi\n` +
    `📦 <b>/ombor</b> — Zaxirasi kam qolgan tovarlar ro'yxati\n` +
    `🏪 <b>/kassirlar</b> — Ochiq smenalar va kassirlar savdosi\n` +
    `⚙️ <b>/sozlamalar</b> — Profil va bildirishnoma parametrlari\n` +
    `🚪 <b>/logout</b> — Akkauntdan chiqish\n\n` +
    `💡 <i>Inline qidiruv: istalgan chatda <code>@boshqaruz_bot tovar_nomi</code> deb yozib narx va qoldiqni bilishingiz mumkin!</i>\n\n` +
    `Savollar yoki yordam uchun: <b>@boshqar_support</b>`;

  return ctx.reply(msg, {
    parse_mode: 'HTML',
    ...(session?.businessId ? getDynamicMenu(session?.settings) : unauthenticatedKeyboard),
  });
}
