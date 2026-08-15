import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const BOT_CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '8984252481:AAHGyWSoSQPFMqW3mQd2mH-mJ-5MmyxZcb8',
  BOT_USERNAME: process.env.BOT_USERNAME || 'Boshqar_uzbot',
  API_URL: process.env.API_URL || 'http://localhost:4000/api/v1',
  SESSIONS_FILE: path.join(__dirname, '..', '..', 'sessions.json'),
};
