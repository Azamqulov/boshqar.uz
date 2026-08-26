import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramService } from '../telegram.service';
import { TelegramNotificationService } from './telegram-notification.service';
import { TelegramReportsService } from './telegram-reports.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TelegramPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramPollingService.name);
  private readonly botToken =
    process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';
  private isPolling = false;
  private offset = 0;

  // Live Vercel WebApp URL
  private readonly webAppUrl = process.env.WEBAPP_URL || 'https://boshqar-uz.vercel.app/';

  // Custom Reply Keyboard for Telegram UI with WebApp button
  private get defaultMenuKeyboard() {
    return {
      keyboard: [
        [
          { text: '📱 POS Kassa & Mini-App', web_app: { url: this.webAppUrl } },
        ],
        [
          { text: '📊 Bugungi Savdo' },
          { text: '📈 Kunlik Hisobot' },
        ],
        [
          { text: '💳 Nasiya & Qarzlar' },
          { text: '💸 Xarajat Kiritish' },
        ],
        [
          { text: '🔍 Tovar Qidiruv' },
          { text: '🏪 Kassa & Xodimlar' },
        ],
        [
          { text: '🤖 Boshqar AI' },
          { text: '⚙️ Sozlamalar' },
        ],
      ],
      resize_keyboard: true,
      is_persistent: true,
    };
  }

  constructor(
    private readonly telegramService: TelegramService,
    private readonly notificationService: TelegramNotificationService,
    private readonly reportsService: TelegramReportsService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    if (this.botToken) {
      this.isPolling = true;
      this.logger.log(`🚀 [TelegramBot] Registering bot commands & WebApp (${this.webAppUrl}) for @Boshqar_uzbot`);

      // Register official Telegram Bot Commands menu
      try {
        await fetch(`https://api.telegram.org/bot${this.botToken}/setMyCommands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commands: [
              { command: 'start', description: '🚀 Botni ishga tushirish va menyu' },
              { command: 'savdo', description: '📊 Bugungi kassa savdosi' },
              { command: 'hisobot', description: '📈 Kunlik va oylik hisobot' },
              { command: 'nasiya', description: '💳 Qarzdor mijozlar ro\'yxati' },
              { command: 'xarajat', description: '💸 Tezkor xarajat kiritish' },
              { command: 'narx', description: '🔍 Tovar va ombor qoldig\'i' },
              { command: 'kassa', description: '🏪 Kassa va smena holati' },
              { command: 'ai', description: '🤖 Boshqar AI yordamchi' },
              { command: 'sozlamalar', description: '⚙️ Sozlamalar va profil' },
            ],
          }),
        });
        this.logger.log('✅ [TelegramBot] setMyCommands menu registered successfully!');
      } catch (err) {
        this.logger.warn(`Failed to set Telegram commands: ${err}`);
      }

      this.pollUpdates();
    }
  }

  onModuleDestroy() {
    this.isPolling = false;
  }

  private async pollUpdates() {
    while (this.isPolling) {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.offset}&timeout=5`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = (await res.json()) as { ok: boolean; result: any[] };
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              this.offset = update.update_id + 1;
              await this.handleUpdate(update);
            }
          }
        }
      } catch (e: any) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  private async handleUpdate(update: any) {
    const message = update.message || update.callback_query?.message;
    const from = update.message?.from || update.callback_query?.from;
    const text = (update.message?.text || update.callback_query?.data || '').trim();

    if (!from || !message) return;

    const chatId = String(from.id);
    const firstName = from.first_name || 'Foydalanuvchi';
    const username = from.username || '';

    // 1. /start command
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const token = parts[1];

      if (token) {
        const result = await this.telegramService.linkChatWithToken(token, chatId, username, firstName);
        if (result.success) {
          this.logger.log(`✅ [TelegramBot] Account linked via /start token for ChatId: ${chatId}`);
          return;
        }
      }

      await this.notificationService.sendMessage(
        chatId,
        `👋 <b>Assalomu alaykum, ${firstName}!</b>\n\n` +
          `<b>boshqar.uz Enterprise Botiga Xush Kelibsiz!</b> 🚀\n\n` +
          `Siz ushbu bot orqali savdolarni, kunlik hisobotlarni, ombor qoldiqlarini hamda Boshqar AI yordamchisini to'g'ridan-to'g'ri Telegram'dan boshqarishingiz mumkin.\n\n` +
          `📌 <b>Quyidagi menyu tugmalaridan foydalaning:</b>\n` +
          `▫️ 📱 <b>POS Kassa & Mini-App</b> — Telegram Mini-App\n` +
          `▫️ 📊 <b>Bugungi Savdo</b> — Kassa statistikasi\n` +
          `▫️ 📈 <b>Kunlik Hisobot</b> — Moliya va foyda\n` +
          `▫️ 💳 <b>Nasiya & Qarzlar</b> — Qarzdor mijozlar\n` +
          `▫️ 💸 <b>Xarajat Kiritish</b> — Tezkor xarajat\n` +
          `▫️ 🤖 <b>Boshqar AI</b> — AI yordamchi\n\n` +
          `🌐 Veb-applikatsiya: <a href="${this.webAppUrl}">boshqar-uz.vercel.app</a>`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // 2. 🤖 Boshqar AI Assistent (/ai command or "Boshqar AI" button)
    if (text.startsWith('/ai') || text.includes('Boshqar AI')) {
      const query = text.replace(/^\/ai\s*/, '').replace('🤖 Boshqar AI', '').trim();

      if (!query) {
        await this.notificationService.sendMessage(
          chatId,
          `🤖 <b>BOSHQAR AI ASSISTENT:</b>\n\n` +
            `Savolingizni quyidagicha yozib yuboring:\n` +
            `👉 <b><code>/ai Bugungi eng ko'p sotilgan tovar qaysi?</code></b>\n` +
            `👉 <b><code>/ai Oylik foydamizni oshirish bo'yicha maslahat ber</code></b>\n` +
            `👉 <b><code>/ai Omborimizdagi tovarlar holati qanday?</code></b>`,
          this.defaultMenuKeyboard,
        );
        return;
      }

      const productsCount = await this.prisma.product.count();
      const todayOrdersCount = await this.prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      });

      await this.notificationService.sendMessage(
        chatId,
        `🤖 <b>BOSHQAR AI TAHLILI:</b>\n\n` +
          `💬 <b>Savol:</b> "${query}"\n\n` +
          `💡 <b>Javob:</b> Bazangiz tahlil qilindi. Bugun <b>${todayOrdersCount} ta</b> savdo bajarildi, jami katalogingizda <b>${productsCount} ta</b> mahsulot mavjud.\n\n` +
          `📌 <i>Tavsiya: Savdo hajmini oshirish uchun kam qolgan tovarlarni o'z vaqtida to'ldiring va eng xaridorgir tovarlarga chegirma bering.</i>`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // 3. 💳 Nasiya & Qarzlar (/nasiya, /qarz)
    if (text === '/nasiya' || text === '/qarz' || text.includes('Nasiya') || text.includes('Qarzlar')) {
      const debtors = await this.prisma.customer.findMany({
        where: { debt: { gt: 0 } },
        orderBy: { debt: 'desc' },
        take: 10,
      });

      if (debtors.length === 0) {
        await this.notificationService.sendMessage(
          chatId,
          `💳 <b>NASIYA VA QARZLAR:</b>\n\n` +
            `🎉 <b>Hozirda qarzdor mijozlar mavjud emas!</b>\n` +
            `Barcha mijozlar bilan hisob-kitoblar to'liq bajarilgan.`,
          this.defaultMenuKeyboard,
        );
        return;
      }

      const totalDebt = debtors.reduce((sum, d) => sum + Number(d.debt || 0), 0);
      let listText = `💳 <b>NASIYA VA QARZDOR MIJOZLAR (boshqar.uz Enterprise):</b>\n\n`;
      listText += `💰 <b>Jami nasiya summasi:</b> ${totalDebt.toLocaleString()} so'm\n`;
      listText += `👥 <b>Qarzdorlar soni:</b> ${debtors.length} ta\n\n`;

      debtors.forEach((d, idx) => {
        listText += `${idx + 1}. <b>${d.fullName}</b> (${d.phone || 'Telefon yo\'q'})\n`;
        listText += `   👉 Qarz: <b>${Number(d.debt).toLocaleString()} so'm</b>\n`;
      });

      listText += `\n💡 <i>Mijozlarga Telegram orqali avtomatik eslatma yuborishingiz mumkin.</i>`;

      await this.notificationService.sendMessage(chatId, listText, this.defaultMenuKeyboard);
      return;
    }

    // 4. 💸 Xarajat Kiritish (/xarajat, /chiqim)
    if (text === '/xarajat' || text === '/chiqim' || text.includes('Xarajat Kiritish')) {
      await this.notificationService.sendMessage(
        chatId,
        `💸 <b>TEZKOR XARAAT KIRITISH:</b>\n\n` +
          `Xarajat kiritish uchun summani va izohni quyidagi shaklda yozib yuboring:\n\n` +
          `👉 <b><code>150000 tushlik</code></b>\n` +
          `👉 <b><code>500000 ijara to'lovi</code></b>\n` +
          `👉 <b><code>80000 transport</code></b>\n\n` +
          `Tizim summani va izohni avtomatik aniqlab, moliyaviy hisobotga qo'shadi!`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // Quick Expense Regex pattern (e.g., "150000 tushlik")
    const expenseMatch = text.match(/^(\d+)\s+(.+)$/);
    if (expenseMatch) {
      const amount = parseInt(expenseMatch[1], 10);
      const description = expenseMatch[2].trim();

      if (amount > 0 && description.length >= 2) {
        const business = await this.prisma.business.findFirst();
        if (business) {
          const branch = await this.prisma.branch.findFirst({ where: { businessId: business.id } });
          await this.prisma.expense.create({
            data: {
              businessId: business.id,
              branchId: branch?.id || '00000000-0000-0000-0000-000000000002',
              category: 'other',
              amount: amount,
              description: description,
              recordedAt: new Date(),
            },
          });

          await this.notificationService.sendMessage(
            chatId,
            `✅ <b>Xarajat Muvaffaqiyatli Saqlandi!</b>\n\n` +
              `💵 <b>Summa:</b> ${amount.toLocaleString()} so'm\n` +
              `📝 <b>Izoh:</b> ${description}\n` +
              `📅 <b>Sana:</b> ${new Date().toLocaleTimeString('uz-UZ')}\n\n` +
              `<i>Moliya va foyda-zarar hisoboti yangilandi.</i>`,
            this.defaultMenuKeyboard,
          );
          return;
        }
      }
    }

    // 5. 🔍 Tovar Qidiruv & Ombor (/narx, /tovar, /ombor)
    if (text === '/ombor' || text.includes('Kam Qolgan') || text.includes('Ombor')) {
      const lowStockProducts = await this.prisma.product.findMany({
        where: { status: 'active' },
        include: { inventory: true },
        take: 10,
      });

      let stockText = `📦 <b>OMBOR QOLDIQLARI VA OGOHLANTIRISH:</b>\n\n`;
      if (lowStockProducts.length === 0) {
        stockText += `✅ <b>Barcha mahsulotlar omborda yetarli darajada mavjud!</b>`;
      } else {
        stockText += `⚠️ <b>Mahsulotlar ombor qoldig'i ro'yxati:</b>\n\n`;
        lowStockProducts.forEach((p, idx) => {
          const totalQty = p.inventory?.reduce((acc, i) => acc + Number(i.quantity || 0), 0) || 0;
          stockText += `${idx + 1}. <b>${p.name}</b> — <b>${totalQty} dona</b> qoldi (Sotuv narxi: ${Number(p.salePrice).toLocaleString()} so'm)\n`;
        });
        stockText += `\n💡 <i>Ta'minotchilarga o'z vaqtida buyurtma berishingiz tavsiya etiladi.</i>`;
      }

      await this.notificationService.sendMessage(chatId, stockText, this.defaultMenuKeyboard);
      return;
    }

    if (text === '/narx' || text === '/tovar' || text.includes('Tovar Qidiruv')) {
      await this.notificationService.sendMessage(
        chatId,
        `🔍 <b>TOVAR QIDIRUV VA NARX:</b>\n\n` +
          `Qidirayotgan mahsulotingiz nomini yozing (masalan: <b>Shakar</b> yoki <b>Kofe</b>).\n` +
          `Tizim narxini va ombor qoldig'ini darhol chiqarib beradi!`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // Product Search Handler by keyword
    if (text.length >= 3 && !text.startsWith('/')) {
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: text, mode: 'insensitive' } },
            { barcode: { contains: text } },
            { sku: { contains: text, mode: 'insensitive' } },
          ],
        },
        include: { inventory: true },
        take: 5,
      });

      if (products.length > 0) {
        let searchRes = `🔎 <b>QIDIRUV NATIJALARI ("${text}"):</b>\n\n`;
        products.forEach((p, idx) => {
          const qty = p.inventory?.reduce((acc, i) => acc + Number(i.quantity || 0), 0) || 0;
          searchRes += `${idx + 1}. <b>${p.name}</b>\n`;
          searchRes += `   💰 Narxi: <b>${Number(p.salePrice).toLocaleString()} so'm</b>\n`;
          searchRes += `   📦 Ombor qoldig'i: <b>${qty} dona</b>\n\n`;
        });
        await this.notificationService.sendMessage(chatId, searchRes, this.defaultMenuKeyboard);
        return;
      }
    }

    // 6. 🏪 Kassa & Xodimlar (/kassa, /smena)
    if (text === '/kassa' || text === '/smena' || text.includes('Kassa & Xodimlar') || text.includes('Mening Smenam')) {
      const shift = await this.prisma.posShift.findFirst({
        where: { status: 'open' },
        include: { user: true },
      });

      if (!shift) {
        await this.notificationService.sendMessage(
          chatId,
          `🏪 <b>KASSA VA SMENA HOLATI:</b>\n\n` +
            `🔴 <b>Hozirda kassa smenasi yopiq.</b>\n` +
            `Savdo qilish uchun POS veb-panelida smenani oching.`,
          this.defaultMenuKeyboard,
        );
        return;
      }

      await this.notificationService.sendMessage(
        chatId,
        `🏪 <b>KASSA VA SMENA HOLATI (OCHIQ):</b>\n\n` +
          `👤 <b>Faol Kassir:</b> ${shift.user?.fullName || 'Kassir'}\n` +
          `⏰ <b>Ochilgan vaqti:</b> ${shift.openedAt.toLocaleTimeString('uz-UZ')}\n` +
          `💵 <b>Kassada boshlang'ich pul:</b> ${Number(shift.startingCash).toLocaleString()} so'm\n` +
          `🟢 <b>Holati:</b> Ochiq va savdoga tayyor`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // 7. ⚙️ Sozlamalar (/sozlamalar)
    if (text === '/sozlamalar' || text.includes('Sozlamalar') || text.includes('Profilim')) {
      await this.notificationService.sendMessage(
        chatId,
        `⚙️ <b>BOSHQAR.UZ BOT SOZLAMALARI:</b>\n\n` +
          `🏢 <b>Biznes:</b> boshqar.uz Demo Store\n` +
          `📱 <b>Bot versiyasi:</b> v2.0 Enterprise\n` +
          `🌐 <b>Vercel Live URL:</b> ${this.webAppUrl}\n` +
          `🔔 <b>Bildirishnomalar:</b> Yoqilgan (Real-time)\n\n` +
          `🌐 Veb-panelga kirish: <a href="${this.webAppUrl}">boshqar-uz.vercel.app</a>`,
        this.defaultMenuKeyboard,
      );
      return;
    }

    // 8. 📊 Kunlik Hisobot & Progress Bar Analytics (/savdo, /hisobot)
    if (text === '/savdo' || text === '/hisobot' || text.includes('Savdo') || text.includes('Hisobot')) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: todayStart },
          status: 'completed',
        },
      });

      const expenses = await this.prisma.expense.findMany({
        where: {
          recordedAt: { gte: todayStart },
        },
      });

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      // ASCII Sales Progress Bar (Target: 2,000,000 UZS)
      const targetSales = 2000000;
      const progressPercent = Math.min(100, Math.round((totalRevenue / targetSales) * 100));
      const filledBlocks = Math.round(progressPercent / 10);
      const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);

      await this.notificationService.sendMessage(
        chatId,
        `📈 <b>KUNLIK ENTERPRISE HISOBOT (boshqar.uz):</b>\n\n` +
          `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n` +
          `🛒 <b>Jami buyurtmalar:</b> ${orders.length} ta\n` +
          `💰 <b>Umumiy tushum:</b> <b>${totalRevenue.toLocaleString()} so'm</b>\n` +
          `📉 <b>Xarajatlar:</b> <b>${totalExpenses.toLocaleString()} so'm</b>\n` +
          `💵 <b>Sof foyda:</b> <b>${netProfit.toLocaleString()} so'm</b>\n\n` +
          `📊 <b>Kunlik Savdo Rejasi Bajarilishi:</b>\n` +
          `<code>[${progressBar}] ${progressPercent}%</code>\n` +
          `🎯 Reja: ${targetSales.toLocaleString()} so'm\n\n` +
          `✅ <i>Barcha ma'lumotlar PostgreSQL ma'lumotlar bazasidan olindi.</i>`,
        this.defaultMenuKeyboard,
      );
      return;
    }
  }
}
