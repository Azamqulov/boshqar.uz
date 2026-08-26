import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const BOT_CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '',
  BOT_USERNAME: process.env.BOT_USERNAME || 'Boshqar_uzbot',
  API_URL: process.env.API_URL || 'http://localhost:4000/api/v1',
  SESSIONS_FILE: path.join(__dirname, '..', '..', 'sessions.json'),
};
