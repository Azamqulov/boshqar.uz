import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { getDynamicMenu } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleShift(ctx: Context) {
  const chatId = ctx.from?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);

  const msg =
    `🏪 <b>KASSA VA SMENALAR HOLATI</b>\n` +
    `🏢 <b>Biznes:</b> ${session?.businessName || 'Asosiy filial'}\n\n` +
    `🟢 <b>Kassa holati:</b> Ochiq (Faol)\n` +
    `⏰ Smena boshlangan: Bugun\n` +
    `👤 Kassir: Navbatchi xodim\n\n` +
    `<i>Barcha savdolar va cheklar real vaqtda qayd etilmoqda.</i>`;

  return ctx.reply(msg, {
    parse_mode: 'HTML',
    ...(session?.businessId ? getDynamicMenu(session.settings) : unauthenticatedKeyboard),
  });
}
