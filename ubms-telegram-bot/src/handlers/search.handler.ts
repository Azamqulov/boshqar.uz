import { Context } from 'telegraf';
import { ApiService } from '../services/api.service';
import { formatSum } from '../utils/formatters';
import { sessionService } from '../services/session.service';

export async function handleProductSearch(ctx: Context) {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = sessionService.getSession(chatId);
  if (!session?.token && !session?.businessId) {
    return ctx.reply("⚠️ Botdan to'liq foydalanish uchun avval akkauntingizga kiring yoki Web paneldan botni ulang.");
  }

  const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
  const parts = messageText.trim().split(/\s+/);
  const query = parts.slice(1).join(' ').trim();

  if (!query) {
    return ctx.reply(
      `🔍 <b>TEZKOR TOVAR VA NARX QIDIRUVI</b>\n\n` +
      `Tovar qoldig'i va narxini bilish uchun quyidagicha yozing:\n\n` +
      `👉 <b>Namuna:</b>\n` +
      `<code>/narx Coca Cola</code>\n` +
      `<code>/narx 4780004870014</code> (shtrix-kod bo'yicha)\n` +
      `<code>/narx Shakar</code>\n\n` +
      `💡 <i>Shuningdek, istalgan chatda <code>@boshqaruz_bot tovar_nomi</code> deb yozib tezkor qidirishingiz mumkin!</i>`,
      { parse_mode: 'HTML' }
    );
  }

  try {
    const loadingMsg = await ctx.reply(`🔍 "${query}" bo'yicha qidirilmoqda...`);
    const { data } = await ApiService.searchProducts(chatId, query);
    const products: any[] = Array.isArray(data) ? data : [];

    if (products.length === 0) {
      if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
      return ctx.reply(`❌ <b>"${query}"</b> nomli mahsulot ombordan topilmadi. Qidiruv so'zini tekshirib qayta urinib ko'ring.`, { parse_mode: 'HTML' });
    }

    let resultText = `📦 <b>"${query}" bo'yicha qidiruv natijalari (${products.length} ta):</b>\n\n`;

    products.forEach((p, index) => {
      const cur = p.currency || session?.currency || 'UZS';
      const stockStatus = p.stock > 0 ? `🟢 <b>${p.stock} ${p.unit}</b>` : `🔴 <b>Tugagan (0 ${p.unit})</b>`;
      resultText += `<b>${index + 1}. ${p.name}</b>\n` +
        `   💵 Sotuv narxi: <b>${formatSum(p.sellingPrice, cur)}</b>\n` +
        (p.costPrice ? `   📥 Tannarx: <i>${formatSum(p.costPrice, cur)}</i>\n` : '') +
        `   📊 Qoldiq: ${stockStatus}\n` +
        (p.barcode ? `   🏷 Shtrix-kod: <code>${p.barcode}</code>\n` : '') +
        `   📂 Kategoriya: ${p.category}\n\n`;
    });

    if (loadingMsg?.message_id) await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

    await ctx.reply(resultText, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error searching products:', error);
    ctx.reply("❌ Qidiruvda xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}

export async function handleInlineQuery(ctx: any) {
  const query = ctx.inlineQuery?.query?.trim();
  const chatId = ctx.from?.id;

  if (!query || !chatId) {
    return ctx.answerInlineQuery([]);
  }

  try {
    const session = sessionService.getSession(chatId);
    const { data } = await ApiService.searchProducts(chatId, query);
    const products: any[] = Array.isArray(data) ? data : [];

    const results = products.slice(0, 10).map((p) => {
      const cur = p.currency || session?.currency || 'UZS';
      const isStockAvailable = p.stock > 0;
      const stockText = isStockAvailable ? `🟢 Qoldiq: ${p.stock} ${p.unit}` : `🔴 Tugagan`;

      return {
        type: 'article',
        id: p.id,
        title: p.name,
        description: `Narxi: ${formatSum(p.sellingPrice, cur)} | ${stockText}`,
        input_message_content: {
          message_text: `📦 <b>${p.name}</b>\n\n` +
            `💵 <b>Sotuv narxi:</b> <b>${formatSum(p.sellingPrice, cur)}</b>\n` +
            (p.costPrice ? `📥 <b>Tannarx:</b> <i>${formatSum(p.costPrice, cur)}</i>\n` : '') +
            `📊 <b>Omborda:</b> ${isStockAvailable ? `<b>${p.stock} ${p.unit}</b>` : `<b>Tugagan</b>`}\n` +
            (p.barcode ? `🏷 <b>Shtrix-kod:</b> <code>${p.barcode}</code>\n` : '') +
            `📂 <b>Kategoriya:</b> ${p.category}`,
          parse_mode: 'HTML',
        },
      };
    });

    await ctx.answerInlineQuery(results, { cache_time: 10 });
  } catch (e) {
    await ctx.answerInlineQuery([]);
  }
}
