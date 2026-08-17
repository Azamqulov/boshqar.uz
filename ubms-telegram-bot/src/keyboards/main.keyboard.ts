import { Markup } from 'telegraf';
import { TelegramNotificationSettings } from '../types/session.types';

export function getDynamicMenu(settings?: TelegramNotificationSettings | null, role?: string) {
  const buttons: string[][] = [];
  const s = settings || {};
  const userRole = (role || s.role || 'owner').toLowerCase();

  // 1. Cashier & Store Staff View
  if (userRole === 'cashier' || userRole === 'employee' || userRole === 'waiter') {
    // Row 1: Personal Sales & Shift
    buttons.push(['💰 Mening Savdom', '👤 Mening Smenam']);

    // Row 2: Price Check & Stock Alert
    const row2: string[] = ['🔍 Tovar & Narx'];
    if (s.notifyOnLowStock !== false) {
      row2.push('📦 Kam Qolgan Mahsulotlar');
    }
    buttons.push(row2);

    // Row 3: Petty Expense & Profile
    const row3: string[] = [];
    if (s.allowExpenseInBot !== false) {
      row3.push('💸 Xarajat Kiritish');
    }
    row3.push('⚙️ Profilim');
    buttons.push(row3);

    // Row 4: Logout
    buttons.push(['🚪 Chiqish']);
    return Markup.keyboard(buttons).resize();
  }

  // 2. Stock / Warehouse Staff View
  if (userRole === 'stockman') {
    buttons.push(['📦 Kam Qolgan Mahsulotlar', '🔍 Tovar Qidiruv']);
    buttons.push(['⚙️ Profilim', '🚪 Chiqish']);
    return Markup.keyboard(buttons).resize();
  }

  // 3. Store Owner / Admin / Full Manager View
  const showSales = s.notifyOnOrder !== false;
  const showDaily = s.notifyDailySummary !== false;
  const showDebts = s.allowDebtsInBot !== false;
  const showExpense = s.allowExpenseInBot !== false;
  const showSearch = s.allowProductSearch !== false;
  const showStock = s.notifyOnLowStock !== false;
  const showCashier = s.allowCashierControl !== false;

  // Row 1: Savdo & Hisobot
  const row1: string[] = [];
  if (showSales) row1.push('💰 Bugungi Savdo');
  if (showDaily) row1.push('📊 Kunlik Hisobot');
  if (row1.length > 0) buttons.push(row1);

  // Row 2: Nasiya & Xarajat
  const row2: string[] = [];
  if (showDebts) row2.push('💳 Nasiya & Qarzlar');
  if (showExpense) row2.push('💸 Xarajat Kiritish');
  if (row2.length > 0) buttons.push(row2);

  // Row 3: Tovar & Ombor
  const row3: string[] = [];
  if (showSearch) row3.push('🔍 Tovar Qidiruv');
  if (showStock) row3.push('📦 Kam Qolgan Mahsulotlar');
  if (row3.length > 0) buttons.push(row3);

  // Row 4: Kassa & Sozlamalar
  const row4: string[] = [];
  if (showCashier) row4.push('🏪 Kassa & Xodimlar');
  row4.push('⚙️ Sozlamalar');
  buttons.push(row4);

  // Row 5: Chiqish
  buttons.push(['🚪 Chiqish']);

  return Markup.keyboard(buttons).resize();
}

export const mainKeyboard = getDynamicMenu();

