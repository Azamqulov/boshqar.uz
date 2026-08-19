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

  // 1. Registration OTP Deep Link
  if (payload && (payload.startsWith('reg_') || payload.startsWith('otp_'))) {
    const rawPhone = payload.replace(/^(reg_|otp_)/, '');
    const cleanPhone = '+' + rawPhone.replace(/\D/g, '');
    try {
      await ApiService.linkChat({
        phone: cleanPhone,
        chatId: String(chatId),
        username: ctx.from?.username,
      }).catch(() => null);

      const { data } = await ApiService.requestRegisterOtp(cleanPhone);
      const code = data?.devOtp || '123456';
      
      return ctx.reply(
        `🚀 <b>Boshqar.uz — Ro'yxatdan O'tish Kodi</b>\n\n` +
        `Sizning 6 xonali tasdiqlash kodingiz:\n\n` +
        `👉 <code>${code}</code> 👈\n\n` +
        `⏳ <i>Ushbu kod 10 daqiqa davomida amal qiladi. Kodni ro'yxatdan o'tish sahifasiga kiriting!</i>\n\n` +
        `🌐 <a href="https://boshqar.uz">boshqar.uz</a>`,
        { parse_mode: 'HTML' }
      );
    } catch (e: any) {
      return ctx.reply(
        `⚠️ <b>Xatolik:</b> ${e?.response?.data?.message || 'Tasdiqlash kodini yuborishda xatolik yuz berdi.'}`,
        { parse_mode: 'HTML' }
      );
    }
  }

  // 2. Password Reset Deep Link
  if (payload && (payload.startsWith('reset_') || payload.startsWith('forgot_'))) {
    const rawPhone = payload.replace(/^(reset_|forgot_)/, '');
    const cleanPhone = '+' + rawPhone.replace(/\D/g, '');
    try {
      await ApiService.linkChat({
        phone: cleanPhone,
        chatId: String(chatId),
        username: ctx.from?.username,
      }).catch(() => null);

      const { data } = await ApiService.requestForgotPasswordOtp(cleanPhone);
      const code = data?.devOtp || '123456';

      return ctx.reply(
        `🔐 <b>Boshqar.uz — Parolni Tiklash Kodi</b>\n\n` +
        `Sizning 6 xonali tasdiqlash kodingiz:\n\n` +
        `👉 <code>${code}</code> 👈\n\n` +
        `⏳ <i>Ushbu kod 10 daqiqa davomida amal qiladi. Kodni saytga kiriting!</i>\n\n` +
        `🌐 <a href="https://boshqar.uz">boshqar.uz</a>`,
        { parse_mode: 'HTML' }
      );
    } catch (e: any) {
      return ctx.reply(
        `⚠️ <b>Xatolik:</b> ${e?.response?.data?.message || 'Parolni tiklash kodini yuborishda xatolik.'}`,
        { parse_mode: 'HTML' }
      );
    }
  }

  // 3. Web panel 1-click token connection
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
          role: 'owner',
          roleLabel: "Do'kon Egasi (Admin)",
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

  // 4. Fetch realtime menu & connection status directly from DB
  try {
    const { data } = await ApiService.getMenuSettings(chatId);
    if (data?.isConnected && data?.businessId) {
      const bId = data.businessId;
      const bName = data.businessName || 'Universal Supermarket & Kafe (Demo)';
      const uName = data.ownerName || ctx.from?.first_name || 'Foydalanuvchi';
      const role = data.role || 'owner';
      const roleLabel = data.roleLabel || (role === 'cashier' ? 'Kassir' : "Do'kon Egasi (Admin)");

      const settings = {
        notifyOnOrder: data.notifyOnOrder === true,
        notifyOnLowStock: data.notifyOnLowStock === true,
        notifyDailySummary: data.notifyDailySummary === true,
        notifyOnShiftClose: data.notifyOnShiftClose === true,
        role,
        roleLabel,
      };

      sessionService.setSession(chatId, {
        businessId: bId,
        businessName: bName,
        userFullName: uName,
        currency: data.currency || 'UZS',
        role,
        roleLabel,
        settings,
        state: 'idle',
      });

      const roleBadge = role === 'owner' || role === 'admin' ? '👑' : role === 'cashier' ? '👤' : '📦';

      return ctx.reply(
        `👋 <b>Xush kelibsiz, ${uName}!</b>\n\n` +
        `🏪 <b>Ulangan biznes:</b> "${bName}"\n` +
        `${roleBadge} <b>Lavozim:</b> ${roleLabel}\n\n` +
        `Quyidagi menyu orqali boshqarishingiz mumkin:`,
        { parse_mode: 'HTML', ...getDynamicMenu(settings, role) }
      );
    }
  } catch (e) {}

  // 3. Fallback to local session
  const session = sessionService.getSession(chatId);
  if (session && (session.businessId || session.token || session.phone || session.userFullName)) {
    const businessName = session.businessName || 'Universal Supermarket & Kafe (Demo)';
    const fullName = session.userFullName || ctx.from?.first_name || 'Foydalanuvchi';
    const businessId = session.businessId || '00000000-0000-0000-0000-000000000100';
    const role = session.role || 'owner';
    const roleLabel = session.roleLabel || (role === 'cashier' ? 'Kassir' : "Do'kon Egasi (Admin)");

    sessionService.setSession(chatId, {
      businessId,
      businessName,
      userFullName: fullName,
      role,
      roleLabel,
      state: 'idle',
    });

    const roleBadge = role === 'owner' || role === 'admin' ? '👑' : role === 'cashier' ? '👤' : '📦';

    return ctx.reply(
      `👋 <b>Xush kelibsiz, ${fullName}!</b>\n\n` +
      `🏪 <b>Biznes:</b> "${businessName}"\n` +
      `${roleBadge} <b>Lavozim:</b> ${roleLabel}\n\n` +
      `Quyidagi menyu orqali boshqarishingiz mumkin:`,
      { parse_mode: 'HTML', ...getDynamicMenu(session.settings, role) }
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
