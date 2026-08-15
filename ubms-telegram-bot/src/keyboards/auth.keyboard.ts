import { Markup } from 'telegraf';

export const unauthenticatedKeyboard = Markup.keyboard([
  [Markup.button.contactRequest('📱 Telefon raqamni yuborish')],
]).resize();
