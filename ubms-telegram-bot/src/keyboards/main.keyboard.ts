import { Markup } from 'telegraf';
import { TelegramNotificationSettings } from '../types/session.types';

export function getDynamicMenu(settings?: TelegramNotificationSettings | null) {
  const buttons: string[][] = [];
  const row1: string[] = [];
  const row2: string[] = [];

  // If settings object is provided, strictly respect its boolean values
  const hasSettings = settings && typeof settings === 'object' && Object.keys(settings).length > 0;

  const showOrder = hasSettings ? settings.notifyOnOrder === true : true;
  const showDaily = hasSettings ? settings.notifyDailySummary === true : true;
  const showStock = hasSettings ? settings.notifyOnLowStock === true : true;
  const showShift = hasSettings ? settings.notifyOnShiftClose === true : true;

  if (showOrder) row1.push('💰 Bugungi Savdo');
  if (showDaily) row1.push('📊 Kunlik Hisobot');
  if (row1.length > 0) buttons.push(row1);

  if (showStock) row2.push('📦 Kam Qolgan Mahsulotlar');
  if (showShift) row2.push('🏪 Kassa & Smenalar');
  if (row2.length > 0) buttons.push(row2);

  // Always keep Utility row
  buttons.push(['⚙️ Sozlamalar', '🚪 Chiqish']);

  return Markup.keyboard(buttons).resize();
}

export const mainKeyboard = getDynamicMenu();

