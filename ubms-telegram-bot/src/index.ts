import { Telegraf } from 'telegraf';
import { BOT_CONFIG } from './config/bot.config';
import { handleStart } from './handlers/start.handler';
import { handleContact, handleTextMessage, handleLogout } from './handlers/auth.handler';
import { handleSales } from './handlers/sales.handler';
import { handleDailyReport } from './handlers/report.handler';
import { handleInventory } from './handlers/inventory.handler';
import { handleShift } from './handlers/shift.handler';
import { handleSettings, handleHelp } from './handlers/settings.handler';
import { setupDailyCron } from './services/cron.service';

const bot = new Telegraf(BOT_CONFIG.BOT_TOKEN);

// 1. Core Handlers
bot.start(handleStart);
bot.on('contact', handleContact);

// 2. Business Dashboard Commands & Menu Buttons
bot.command('savdo', handleSales);
bot.hears('💰 Bugungi Savdo', handleSales);

bot.command('hisobot', handleDailyReport);
bot.command('kpi', handleDailyReport);
bot.hears('📊 Kunlik Hisobot', handleDailyReport);

bot.command('ombor', handleInventory);
bot.hears('📦 Kam Qolgan Mahsulotlar', handleInventory);

bot.command('kassa', handleShift);
bot.hears('🏪 Kassa & Smenalar', handleShift);

bot.command('sozlamalar', handleSettings);
bot.hears('⚙️ Sozlamalar', handleSettings);

bot.command('yordam', handleHelp);
bot.command('help', handleHelp);

bot.command('logout', handleLogout);
bot.hears('🚪 Chiqish', handleLogout);

// 3. Fallback & Interactive Text Input (Phone/Password)
bot.on('text', handleTextMessage);

// 4. Cron Jobs
setupDailyCron(bot);

// 5. Bot Launch
bot.launch().then(() => {
  console.log(`🤖 boshqar.uz Telegram Bot started successfully (@${BOT_CONFIG.BOT_USERNAME})`);
}).catch((err) => {
  console.error('❌ Failed to launch Telegram Bot:', err);
});

// Graceful Shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
