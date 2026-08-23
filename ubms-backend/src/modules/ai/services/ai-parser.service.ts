import { Injectable, Logger } from '@nestjs/common';
import { ParsedProductItem, ParseProductsResult } from '../ai.service';

@Injectable()
export class AiParserService {
  private readonly logger = new Logger(AiParserService.name);

  public parseProductsFromRawText(text: string): ParseProductsResult {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const products: ParsedProductItem[] = [];
    const detectedCategories = new Set<string>();

    for (const line of lines) {
      if (/^(tovar|nomi|mahsulot|narx|narxi|kategoriya|ombor|soni|dona|kg)/i.test(line)) {
        continue;
      }

      const parts = line.split(/[,;\t|]+/).map((p) => p.trim());
      let name = '';
      let salePrice = 0;
      let purchasePrice: number | undefined;
      let initialStock: number | undefined;
      let categoryName: string | undefined;
      let barcode: string | undefined;

      if (parts.length >= 2) {
        name = parts[0];
        const num1 = parseFloat(parts[1].replace(/\s+/g, '').replace(',', '.'));
        if (!isNaN(num1)) salePrice = num1;

        if (parts.length >= 3) {
          const num2 = parseFloat(parts[2].replace(/\s+/g, '').replace(',', '.'));
          if (!isNaN(num2)) purchasePrice = num2;
        }

        if (parts.length >= 4) {
          const num3 = parseFloat(parts[3].replace(/\s+/g, '').replace(',', '.'));
          if (!isNaN(num3)) initialStock = num3;
        }

        if (parts.length >= 5 && isNaN(parseFloat(parts[4]))) {
          categoryName = parts[4];
          detectedCategories.add(categoryName);
        }

        if (parts.length >= 6 && /^\d{8,14}$/.test(parts[5])) {
          barcode = parts[5];
        }
      } else {
        const priceMatch = line.match(/(\d[\d\s,.]*)\s*(so'm|som|uzs|\$|rub)?$/i);
        if (priceMatch) {
          name = line.substring(0, priceMatch.index).trim();
          salePrice = parseFloat(priceMatch[1].replace(/\s+/g, '').replace(',', '.'));
        }
      }

      if (name && name.length >= 2 && salePrice > 0) {
        products.push({
          name,
          salePrice,
          purchasePrice,
          initialStock: initialStock ?? 10,
          categoryName: categoryName || 'Umumiy',
          barcode,
        });
      }
    }

    return {
      success: products.length > 0,
      totalParsed: products.length,
      summary: products.length > 0 ? `${products.length} ta mahsulot muvaffaqiyatli aniqlandi` : 'Mahsulotlar topilmadi',
      products,
      detectedCategories: Array.from(detectedCategories),
    };
  }
}
