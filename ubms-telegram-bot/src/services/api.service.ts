import axios from 'axios';
import { BOT_CONFIG } from '../config/bot.config';
import { sessionService } from './session.service';

export class ApiService {
  private static getHeaders(chatId: number) {
    const session = sessionService.getSession(chatId);
    return {
      Authorization: session?.token ? `Bearer ${session.token}` : undefined,
      'x-business-id': session?.businessId || undefined,
    };
  }

  static async login(phone: string, password: string) {
    return axios.post(`${BOT_CONFIG.API_URL}/auth/login`, {
      login: phone,
      password: password,
    });
  }

  static async findByChatId(chatId: number) {
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/find-by-chat/${chatId}`);
  }

  static async getMenuSettings(chatId: number) {
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/menu-settings/${chatId}`);
  }

  static async linkChat(payload: { token?: string; businessId?: string; phone?: string; chatId: string; username?: string }) {
    return axios.post(`${BOT_CONFIG.API_URL}/telegram/link-chat`, payload);
  }

  static async getDashboardSummary(chatId: number) {
    const session = sessionService.getSession(chatId);
    if (session?.token) {
      const headers = this.getHeaders(chatId);
      return axios.get(`${BOT_CONFIG.API_URL}/dashboard/summary`, { headers });
    }
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/summary/${businessId}`);
  }

  static async getInventoryLowStock(chatId: number) {
    const session = sessionService.getSession(chatId);
    if (session?.token) {
      const headers = this.getHeaders(chatId);
      return axios.get(`${BOT_CONFIG.API_URL}/inventory?page=1&limit=15`, { headers });
    }
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/inventory/${businessId}`);
  }
}
