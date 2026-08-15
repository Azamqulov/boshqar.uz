import { Context } from 'telegraf';
import { sessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';
import { getDynamicMenu } from '../keyboards/main.keyboard';
import { unauthenticatedKeyboard } from '../keyboards/auth.keyboard';

export async function handleInventory(ctx: Context) {
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
    const { data } = await ApiService.getInventoryLowStock(chatId);

    const items = data.items || data || [];
    const lowStock = items.filter((i: any) => {
      const quantity = Number(i.quantity || 0);
      const minQty = Number(i.minQuantity || i.min_quantity || 10);
      return quantity <= minQty;
    });

    if (lowStock.length === 0) {
      return ctx.reply(
        `✅ <b>Omborda barcha tovarlar yetarli!</b>\n\nKam qolgan mahsulotlar aniqlanmadi.`,
        { parse_mode: 'HTML', ...getDynamicMenu(session.settings) }
      );
    }

    let msg = `⚠️ <b>KAM QOLGAN MAHSULOTLAR RO'YXATI:</b>\n🏢 ${session.businessName || 'Do\'kon'}\n\n`;

    lowStock.slice(0, 10).forEach((item: any, idx: number) => {
      const name = item.product?.name || item.name || 'Noma\'lum tovar';
      const unit = item.product?.unit || item.unit || 'dona';
      const qty = item.quantity || 0;
      const min = item.minQuantity || item.min_quantity || 10;

      msg += `${idx + 1}. <b>${name}</b>: <code>${qty} ${unit}</code> (Min: ${min})\n`;
    });

    if (lowStock.length > 10) {
      msg += `\n<i>... va yana ${lowStock.length - 10} ta tovar.</i>\n`;
    }

    msg += `\n<i>Iltimos, o'z vaqtida ta'minotchiga buyurtma bering yoki omborga kirim qiling!</i>`;

    return ctx.reply(msg, { parse_mode: 'HTML', ...getDynamicMenu(session.settings) });
  } catch (e: any) {
    return ctx.reply("❌ Ombor ma'lumotlarini yuklashda xatolik yuz berdi.");
  }
}
