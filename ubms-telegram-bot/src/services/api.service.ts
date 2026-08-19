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

  static async getDebts(chatId: number) {
    const session = sessionService.getSession(chatId);
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/debts/${businessId}`);
  }

  static async createExpense(chatId: number, amount: number, description: string, category?: string) {
    const session = sessionService.getSession(chatId);
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.post(`${BOT_CONFIG.API_URL}/telegram/expense`, {
      businessId,
      amount,
      description,
      category,
    });
  }

  static async searchProducts(chatId: number, query: string) {
    const session = sessionService.getSession(chatId);
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/search-products/${businessId}?q=${encodeURIComponent(query)}`);
  }

  static async getCashiers(chatId: number) {
    const session = sessionService.getSession(chatId);
    const businessId = session?.businessId || '00000000-0000-0000-0000-000000000100';
    return axios.get(`${BOT_CONFIG.API_URL}/telegram/cashiers/${businessId}`);
  }

  static async dispatchDailySummaries() {
    return axios.post(`${BOT_CONFIG.API_URL}/telegram/dispatch-daily-summaries`);
  }

  static async requestRegisterOtp(phone: string) {
    return axios.post(`${BOT_CONFIG.API_URL}/auth/send-register-otp`, { phone });
  }

  static async requestForgotPasswordOtp(phone: string) {
    return axios.post(`${BOT_CONFIG.API_URL}/auth/forgot-password`, { login: phone });
  }
}

