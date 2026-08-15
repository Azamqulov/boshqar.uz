import { Context, Markup } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { normalizeUzbekPhone, formatUzbekPhoneDisplay } from '../utils/formatters';
import { mainKeyboard } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleContact(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const phone = (ctx.message as any)?.contact?.phone_number;
  if (!phone) return;

  const normalized = normalizeUzbekPhone(phone);
  sessionService.setSession(chatId, {
    tempPhone: normalized,
    state: 'awaiting_password',
  });

  return ctx.reply(
    `📱 Telefon raqam: <b>${formatUzbekPhoneDisplay(normalized)}</b>\n\n` +
    `🔑 Endi <b>boshqar.uz parolingizni</b> kiriting:`,
    { parse_mode: 'HTML', ...Markup.removeKeyboard() }
  );
}

export async function handleTextMessage(ctx: Context, next: () => Promise<void>) {
  const text = ((ctx.message as any)?.text || '').trim();
  const chatId = ctx.from?.id;
  if (!chatId || !text) return next();

  const session = sessionService.getSession(chatId);

  // Skip commands and known buttons
  if (['💰 Bugungi Savdo', '📊 Kunlik Hisobot', '📦 Kam Qolgan Mahsulotlar', '🏪 Kassa & Smenalar', '⚙️ Sozlamalar', '🚪 Chiqish'].includes(text)) {
    return next();
  }

  // 1. Awaiting Phone input as plain text
  if (session?.state === 'awaiting_phone') {
    const cleanDigits = text.replace(/\D/g, '');
    if (cleanDigits.length < 9) {
      return ctx.reply(
        `⚠️ <b>Telefon raqami to'liq emas.</b>\n` +
        `Iltimos, 9 xonali raqamni kiriting:\n(Masalan: <code>77 040 46 24</code> yoki <code>90 123 45 67</code>)`,
        { parse_mode: 'HTML' }
      );
    }

    const normalized = normalizeUzbekPhone(cleanDigits);
    sessionService.setSession(chatId, {
      tempPhone: normalized,
      state: 'awaiting_password',
    });

    return ctx.reply(
      `📱 Telefon raqam: <b>${formatUzbekPhoneDisplay(normalized)}</b>\n\n` +
      `🔑 <b>boshqar.uz parolingizni</b> kiriting:`,
      { parse_mode: 'HTML' }
    );
  }

  // 2. Awaiting Password
  if (session?.state === 'awaiting_password') {
    const phone = session.tempPhone || '';
    const password = text;

    try {
      await ctx.deleteMessage((ctx.message as any)?.message_id);
    } catch (e) {}

    const waitMsg = await ctx.reply("⏳ Tizimga kirilmoqda, iltimos kuting...");

    try {
      const { data } = await ApiService.login(phone, password);
      const user = data.user;
      const business = data.business || (user.businesses && user.businesses[0]) || (data.user?.businessUsers && data.user.businessUsers[0]?.business);
      const businessId = business?.id || data.businessId;
      const businessName = business?.name || 'Asosiy Biznes';

      sessionService.setSession(chatId, {
        token: data.accessToken,
        businessId: businessId,
        businessName: businessName,
        userFullName: user.fullName || user.name,
        phone: phone,
        state: 'idle',
      });

      // Auto-link in backend database
      ApiService.linkChat({
        phone,
        businessId,
        chatId: String(chatId),
        username: ctx.from?.username,
      }).catch(() => null);

      try {
        await ctx.deleteMessage(waitMsg.message_id);
      } catch (e) {}

      return ctx.reply(
        `🎉 <b>Muvaffaqiyatli kirdingiz!</b>\n\n` +
        `👤 <b>Foydalanuvchi:</b> ${user.fullName || user.phone}\n` +
        `🏪 <b>Biznes:</b> ${businessName}\n\n` +
        `Endi quyidagi menyu orqali boshqarishingiz mumkin:`,
        { parse_mode: 'HTML', ...mainKeyboard }
      );
    } catch (err: any) {
      try {
        await ctx.deleteMessage(waitMsg.message_id);
      } catch (e) {}

      const errMsg = err.response?.data?.message || 'Telefon raqam yoki parol noto\'g\'ri.';
      sessionService.setSession(chatId, { state: 'awaiting_phone' });

      return ctx.reply(
        `❌ <b>Kirishda xatolik:</b> ${errMsg}\n\n` +
        `Iltimos, telefon raqamingizni qaytadan yuboring yoki kiriting:`,
        { parse_mode: 'HTML', ...unauthenticatedKeyboard }
      );
    }
  }

  return next();
}

export async function handleLogout(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  sessionService.deleteSession(chatId);

  return ctx.reply(
    `🚪 <b>Akkauntdan chiqildi.</b>\n\nQayta kirish uchun telefon raqam va parolingizni kiriting:`,
    { parse_mode: 'HTML', ...unauthenticatedKeyboard }
  );
}
