import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { getDynamicMenu, mainKeyboard } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleStart(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const text = (ctx.message as any)?.text || '';
  const payload = text.split(' ')[1];

  // 1. Web panel 1-click token connection
  if (payload && payload.startsWith('connect_')) {
    const token = payload.replace('connect_', '');
    try {
      const { data } = await ApiService.linkChat({
        token,
        chatId: String(chatId),
        username: ctx.from?.username,
      });

      if (data?.success) {
        sessionService.setSession(chatId, {
          businessId: token,
          businessName: data.businessName,
          state: 'idle',
        });

        return ctx.reply(
          `🎉 <b>Assalomu alaykum, ${ctx.from?.first_name}!</b>\n\n` +
          `✅ <b>"${data.businessName || 'Biznesingiz'}"</b> muvaffaqiyatli ulandi!\n\n` +
          `Endi barcha savdolar, hisobotlar va ogohlantirishlar shu yerga keladi.\n` +
          `Quyidagi menyu orqali tezkor hisobotlarni olishingiz mumkin:`,
          { parse_mode: 'HTML', ...mainKeyboard }
        );
      }
    } catch (e) {}
  }

  // 2. Fetch realtime menu & connection status directly from DB
  try {
    const { data } = await ApiService.getMenuSettings(chatId);
    if (data?.isConnected && data?.businessId) {
      const bId = data.businessId;
      const bName = data.businessName || 'Universal Supermarket & Kafe (Demo)';
      const uName = data.ownerName || ctx.from?.first_name || 'Boshqaruvchi Admin';
      const settings = {
        notifyOnOrder: data.notifyOnOrder === true,
        notifyOnLowStock: data.notifyOnLowStock === true,
        notifyDailySummary: data.notifyDailySummary === true,
        notifyOnShiftClose: data.notifyOnShiftClose === true,
      };

      sessionService.setSession(chatId, {
        businessId: bId,
        businessName: bName,
        userFullName: uName,
        settings,
        state: 'idle',
      });

      return ctx.reply(
        `👋 <b>Xush kelibsiz, ${uName}!</b>\n\n` +
        `🏪 <b>Ulangan biznes:</b> "${bName}"\n\n` +
        `Quyidagi menyu orqali boshqarishingiz mumkin:`,
        { parse_mode: 'HTML', ...getDynamicMenu(settings) }
      );
    }
  } catch (e) {}

  // 3. Fallback to local session
  const session = sessionService.getSession(chatId);
  if (session && (session.businessId || session.token || session.phone || session.userFullName)) {
    const businessName = session.businessName || 'Universal Supermarket & Kafe (Demo)';
    const fullName = session.userFullName || ctx.from?.first_name || 'Boshqaruvchi Admin';
    const businessId = session.businessId || '00000000-0000-0000-0000-000000000100';

    sessionService.setSession(chatId, {
      businessId,
      businessName,
      userFullName: fullName,
      state: 'idle',
    });

    return ctx.reply(
      `👋 <b>Xush kelibsiz, ${fullName}!</b>\n\n` +
      `🏪 <b>Biznes:</b> "${businessName}"\n\n` +
      `Quyidagi menyu orqali boshqarishingiz mumkin:`,
      { parse_mode: 'HTML', ...getDynamicMenu(session.settings) }
    );
  }

  // 4. Prompt login only for completely brand new users
  sessionService.setSession(chatId, { state: 'awaiting_phone' });

  return ctx.reply(
    `👋 <b>Assalomu alaykum, ${ctx.from?.first_name}!</b>\n\n` +
    `🤖 <b>boshqar.uz — Telegram Boti</b>ga xush kelibsiz.\n\n` +
    `Biznesingiz hisobotlari va savdolarini ko'rish uchun <b>tizimga kiring</b>:\n\n` +
    `Quyidagi tugma orqali <b>telefon raqamingizni yuboring</b> yoki yozing:\n` +
    `<i>(Masalan: <code>77 040 46 24</code> yoki <code>90 123 45 67</code>)</i>`,
    { parse_mode: 'HTML', ...unauthenticatedKeyboard }
  );
}
