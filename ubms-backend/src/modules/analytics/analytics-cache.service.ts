import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsCacheService {
  private readonly logger = new Logger(AnalyticsCacheService.name);
  private memoryCache = new Map<string, { data: any; expiresAt: number }>();

  /**
   * Keshdan olish yoki hisoblab keshga yozish
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.memoryCache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    const freshData = await fetchFn();
    this.memoryCache.set(key, {
      data: freshData,
      expiresAt: now + ttlSeconds * 1000,
    });

    return freshData;
  }

  /**
   * Biznes keshini tozalash (yangi savdo bo'lganda)
   */
  invalidateBusiness(businessId: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`analytics:${businessId}`)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
