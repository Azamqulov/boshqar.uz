import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as https from 'https';

export interface CbuCurrencyRate {
  id: number;
  code: string; // '840'
  ccy: string;  // 'USD'
  ccyNm_UZ: string;
  ccyNm_RU: string;
  ccyNm_EN: string;
  nominal: string; // '1'
  rate: string;    // '11937.89'
  diff: string;    // '-10.69'
  date: string;    // '14.08.2026'
  rateNumber: number;
}

export interface CurrencyConversionDto {
  amount: number;
  from: string;
  to: string;
}

@Injectable()
export class CurrenciesService implements OnModuleInit {
  private readonly logger = new Logger(CurrenciesService.name);

  // In-memory cache of CBU rates
  private cachedRates: Record<string, CbuCurrencyRate> = {};
  private lastFetchedAt: Date | null = null;

  // Resilient fallback rates in case CBU API is temporarily unreachable
  private readonly fallbackRates: Record<string, number> = {
    USD: 11937.89,
    EUR: 13769.16,
    RUB: 141.76,
    KZT: 24.50,
    CNY: 1675.30,
    UZS: 1.0,
  };

  async onModuleInit() {
    await this.fetchCbuRates().catch((err) => {
      this.logger.warn(`Failed initial CBU fetch, using fallbacks: ${err.message}`);
    });
  }

  /**
   * Fetches latest official currency rates from Central Bank of Uzbekistan (cbu.uz)
   */
  async fetchCbuRates(): Promise<Record<string, CbuCurrencyRate>> {
    return new Promise((resolve) => {
      const url = 'https://cbu.uz/oz/arkhiv-kursov-valyut/json/';
      const req = https.get(
        url,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BoshqarUz/2.0; +https://boshqar.uz)' },
          timeout: 6000,
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => (rawData += chunk));
          res.on('end', () => {
            try {
              const data = JSON.parse(rawData);
              if (Array.isArray(data)) {
                const map: Record<string, CbuCurrencyRate> = {
                  UZS: {
                    id: 0,
                    code: '860',
                    ccy: 'UZS',
                    ccyNm_UZ: "O'zbekiston so'mi",
                    ccyNm_RU: 'Узбекский сум',
                    ccyNm_EN: 'Uzbekistan Sum',
                    nominal: '1',
                    rate: '1',
                    diff: '0',
                    date: new Date().toLocaleDateString('uz-UZ'),
                    rateNumber: 1,
                  },
                };

                for (const item of data) {
                  if (item.Ccy && item.Rate) {
                    const numRate = parseFloat(item.Rate) / (parseFloat(item.Nominal) || 1);
                    map[item.Ccy.toUpperCase()] = {
                      id: item.id,
                      code: item.Code,
                      ccy: item.Ccy.toUpperCase(),
                      ccyNm_UZ: item.CcyNm_UZ || item.Ccy,
                      ccyNm_RU: item.CcyNm_RU || item.Ccy,
                      ccyNm_EN: item.CcyNm_EN || item.Ccy,
                      nominal: item.Nominal || '1',
                      rate: item.Rate,
                      diff: item.Diff || '0',
                      date: item.Date,
                      rateNumber: numRate,
                    };
                  }
                }

                this.cachedRates = map;
                this.lastFetchedAt = new Date();
                this.logger.log(`Successfully updated ${Object.keys(map).length} currency rates from CBU.uz (USD: ${map.USD?.rate || 'N/A'})`);
                return resolve(this.cachedRates);
              }
            } catch (err: any) {
              this.logger.error(`Error parsing CBU rates JSON: ${err.message}`);
            }
            this.ensureFallbackRates();
            resolve(this.cachedRates);
          });
        },
      );

      req.on('error', (err) => {
        this.logger.warn(`CBU API request error: ${err.message}`);
        this.ensureFallbackRates();
        resolve(this.cachedRates);
      });

      req.on('timeout', () => {
        req.destroy();
        this.logger.warn('CBU API request timed out, using cached/fallback rates');
        this.ensureFallbackRates();
        resolve(this.cachedRates);
      });
    });
  }

  private ensureFallbackRates() {
    if (Object.keys(this.cachedRates).length <= 1) {
      const today = new Date().toLocaleDateString('uz-UZ');
      this.cachedRates = {
        UZS: {
          id: 0,
          code: '860',
          ccy: 'UZS',
          ccyNm_UZ: "O'zbekiston so'mi",
          ccyNm_RU: 'Узбекский сум',
          ccyNm_EN: 'Uzbekistan Sum',
          nominal: '1',
          rate: '1',
          diff: '0',
          date: today,
          rateNumber: 1,
        },
        USD: {
          id: 68,
          code: '840',
          ccy: 'USD',
          ccyNm_UZ: 'AQSH dollari',
          ccyNm_RU: 'Доллар США',
          ccyNm_EN: 'US Dollar',
          nominal: '1',
          rate: String(this.fallbackRates.USD),
          diff: '0',
          date: today,
          rateNumber: this.fallbackRates.USD,
        },
        EUR: {
          id: 20,
          code: '978',
          ccy: 'EUR',
          ccyNm_UZ: 'EVRO',
          ccyNm_RU: 'Евро',
          ccyNm_EN: 'Euro',
          nominal: '1',
          rate: String(this.fallbackRates.EUR),
          diff: '0',
          date: today,
          rateNumber: this.fallbackRates.EUR,
        },
        RUB: {
          id: 56,
          code: '643',
          ccy: 'RUB',
          ccyNm_UZ: 'Rossiya rubli',
          ccyNm_RU: 'Российский рубль',
          ccyNm_EN: 'Russian Ruble',
          nominal: '1',
          rate: String(this.fallbackRates.RUB),
          diff: '0',
          date: today,
          rateNumber: this.fallbackRates.RUB,
        },
      };
      this.lastFetchedAt = new Date();
    }
  }

  /**
   * Get all active exchange rates with metadata
   */
  async getRates() {
    if (Object.keys(this.cachedRates).length === 0) {
      await this.fetchCbuRates();
    }

    return {
      success: true,
      lastUpdated: this.lastFetchedAt,
      source: 'Markaziy Bank (CBU.uz)',
      baseCurrency: 'UZS',
      mainRates: {
        USD: this.cachedRates['USD'] || null,
        EUR: this.cachedRates['EUR'] || null,
        RUB: this.cachedRates['RUB'] || null,
        KZT: this.cachedRates['KZT'] || null,
        CNY: this.cachedRates['CNY'] || null,
      },
      allRates: this.cachedRates,
    };
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, from = 'UZS', to = 'UZS') {
    const fromCcy = from.toUpperCase();
    const toCcy = to.toUpperCase();

    if (fromCcy === toCcy) {
      return {
        amount,
        from: fromCcy,
        to: toCcy,
        rate: 1,
        result: amount,
      };
    }

    this.ensureFallbackRates();

    const fromRate = this.cachedRates[fromCcy]?.rateNumber || this.fallbackRates[fromCcy] || 1;
    const toRate = this.cachedRates[toCcy]?.rateNumber || this.fallbackRates[toCcy] || 1;

    // Convert from origin currency to UZS first, then to target currency
    const amountInUzs = amount * fromRate;
    const result = amountInUzs / toRate;
    const effectiveRate = fromRate / toRate;

    return {
      amount,
      from: fromCcy,
      to: toCcy,
      rate: effectiveRate,
      result: Number(result.toFixed(2)),
      amountInUzs: Number(amountInUzs.toFixed(2)),
    };
  }
}
