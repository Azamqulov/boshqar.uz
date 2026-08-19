import { Telegraf } from 'telegraf';
import { BOT_CONFIG } from './config/bot.config';
import { handleStart } from './handlers/start.handler';
import { handleContact, handleTextMessage, handleLogout } from './handlers/auth.handler';
import { handleSales } from './handlers/sales.handler';
import { handleDailyReport } from './handlers/report.handler';
import { handleInventory } from './handlers/inventory.handler';
import { handleShift } from './handlers/shift.handler';
import { handleSettings, handleHelp } from './handlers/settings.handler';
import { handleDebts, handleDebtReminderTemplate } from './handlers/debt.handler';
import { handleExpense } from './handlers/expense.handler';
import { handleProductSearch, handleInlineQuery } from './handlers/search.handler';
import { handleCashiers } from './handlers/cashier.handler';
import { setupDailyCron } from './services/cron.service';

const bot = new Telegraf(BOT_CONFIG.BOT_TOKEN);

// 1. Core Handlers
bot.start(handleStart);
bot.on('contact', handleContact);

// 2. Business Dashboard Commands & Menu Buttons
bot.command('savdo', handleSales);
bot.hears('💰 Bugungi Savdo', handleSales);
bot.hears('💰 Mening Savdom', handleSales);

bot.command('hisobot', handleDailyReport);
bot.command('kpi', handleDailyReport);
bot.hears('📊 Kunlik Hisobot', handleDailyReport);

// 3. Debts & Nasiya
bot.command('nasiya', handleDebts);
bot.command('qarz', handleDebts);
bot.hears('💳 Nasiya & Qarzlar', handleDebts);
bot.action('debt_reminder_template', handleDebtReminderTemplate);

// 4. Quick Expense / Chiqim
bot.command('xarajat', handleExpense);
bot.command('chiqim', handleExpense);
bot.hears('💸 Xarajat Kiritish', handleExpense);

// 5. Product Search & Stock
bot.command('narx', handleProductSearch);
bot.command('tovar', handleProductSearch);
bot.hears('🔍 Tovar Qidiruv', handleProductSearch);
bot.hears('🔍 Tovar & Narx', handleProductSearch);
bot.on('inline_query', handleInlineQuery);

// 6. Inventory & Low Stock
bot.command('ombor', handleInventory);
bot.hears('📦 Kam Qolgan Mahsulotlar', handleInventory);
bot.hears('📦 Ombor & Qoldiq', handleInventory);

// 7. Cashiers & Shifts
bot.command('kassa', handleShift);
bot.command('kassirlar', handleCashiers);
bot.command('xodimlar', handleCashiers);
bot.command('smena', handleCashiers);
bot.hears('🏪 Kassa & Xodimlar', handleCashiers);
bot.hears('👤 Mening Smenam', handleCashiers);

// 8. Settings & Help
bot.command('sozlamalar', handleSettings);
bot.command('profil', handleSettings);
bot.hears('⚙️ Sozlamalar', handleSettings);
bot.hears('⚙️ Profilim', handleSettings);

bot.command('yordam', handleHelp);
bot.command('help', handleHelp);

bot.command('logout', handleLogout);
bot.hears('🚪 Chiqish', handleLogout);

// 3. Fallback & Interactive Text Input (Phone/Password)
bot.on('text', handleTextMessage);

// 4. Cron Jobs
setupDailyCron(bot);

// 5. Bot Launch
console.log(`⏳ Starting @${BOT_CONFIG.BOT_USERNAME}...`);
bot.launch({ dropPendingUpdates: true })
  .then(() => {
    console.log(`🤖 boshqar.uz Telegram Bot started successfully (@${BOT_CONFIG.BOT_USERNAME})`);
  })
  .catch((err) => {
    console.error('❌ Failed to launch Telegram Bot:', err);
  });

// Graceful Shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
