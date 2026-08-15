import * as fs from 'fs';
import { BOT_CONFIG } from '../config/bot.config';
import { UserSession } from '../types/session.types';

class SessionService {
  private sessions = new Map<number, UserSession>();

  constructor() {
    this.loadSessions();
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(BOT_CONFIG.SESSIONS_FILE)) {
        const data = fs.readFileSync(BOT_CONFIG.SESSIONS_FILE, 'utf-8');
        const obj = JSON.parse(data);
        for (const [k, v] of Object.entries(obj)) {
          this.sessions.set(Number(k), v as UserSession);
        }
      }
    } catch (e) {
      console.warn('Failed to read sessions.json:', e);
    }
  }

  private persist(): void {
    try {
      const obj: Record<string, UserSession> = {};
      for (const [k, v] of this.sessions.entries()) {
        obj[String(k)] = v;
      }
      fs.writeFileSync(BOT_CONFIG.SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to write sessions.json:', e);
    }
  }

  getSession(chatId: number): UserSession | undefined {
    return this.sessions.get(chatId);
  }

  setSession(chatId: number, session: Partial<UserSession>): void {
    const existing = this.sessions.get(chatId) || {};
    this.sessions.set(chatId, { ...existing, ...session });
    this.persist();
  }

  deleteSession(chatId: number): void {
    this.sessions.delete(chatId);
    this.persist();
  }

  getAllSessions(): Map<number, UserSession> {
    return this.sessions;
  }
}

export const sessionService = new SessionService();
