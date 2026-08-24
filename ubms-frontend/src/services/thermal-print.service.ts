/**
 * Thermal Printer Direct ESC/POS Print Service
 * Supports 58mm (32 chars/line) and 80mm (48 chars/line) thermal receipt printers
 */

export interface ReceiptPrintData {
  orderNumber: string;
  businessName: string;
  cashierName: string;
  createdAt: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  fiscalSign?: string;
  qrCodeUrl?: string;
}

export class ThermalPrintService {
  /**
   * Generates ESC/POS formatted raw text for thermal printers
   */
  static formatEscPosText(data: ReceiptPrintData, paperWidth: '58mm' | '80mm' = '80mm'): string {
    const lineCharCount = paperWidth === '58mm' ? 32 : 48;
    const divider = '='.repeat(lineCharCount);
    const subDivider = '-'.repeat(lineCharCount);

    const padLeftRight = (left: string, right: string) => {
      const spaceLen = lineCharCount - left.length - right.length;
      if (spaceLen <= 0) return `${left.slice(0, lineCharCount - right.length - 1)} ${right}`;
      return `${left}${' '.repeat(spaceLen)}${right}`;
    };

    const lines: string[] = [];

    // Header
    lines.push(data.businessName.toUpperCase());
    lines.push(`CHEK: ${data.orderNumber}`);
    lines.push(`SANA: ${data.createdAt}`);
    lines.push(`KASSIR: ${data.cashierName}`);
    lines.push(divider);

    // Items
    lines.push(padLeftRight('MAHSULOT', 'SUMMA'));
    lines.push(subDivider);

    for (const item of data.items) {
      lines.push(item.name);
      lines.push(padLeftRight(`  ${item.qty} x ${item.price.toLocaleString()} so'm`, `${item.total.toLocaleString()} so'm`));
    }

    lines.push(divider);

    // Totals
    if (data.discount > 0) {
      lines.push(padLeftRight('CHEGIRMA:', `-${data.discount.toLocaleString()} so'm`));
    }
    lines.push(padLeftRight('JAMI TO\'LOV:', `${data.total.toLocaleString()} so'm`));
    lines.push(padLeftRight('TO\'LOV TURI:', data.paymentMethod.toUpperCase()));

    if (data.fiscalSign) {
      lines.push(subDivider);
      lines.push(`SOLIQ FISKAL: ${data.fiscalSign}`);
    }

    lines.push(divider);
    lines.push('XARIDINGIZ UCHUN RAHMAT!');
    lines.push('\n\n\n'); // Feed lines for cutter

    return lines.join('\n');
  }

  /**
   * Direct silent print handler
   */
  static printDirect(data: ReceiptPrintData, paperWidth: '58mm' | '80mm' = '80mm'): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const textContent = this.formatEscPosText(data, paperWidth);

        // Open hidden iframe for silent printing without browser dialog modal overlay
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';

        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <html>
              <head>
                <style>
                  @page { size: ${paperWidth === '58mm' ? '58mm' : '80mm'} auto; margin: 0; }
                  body { font-family: monospace; font-size: 11px; white-space: pre-wrap; margin: 5px; }
                </style>
              </head>
              <body>${textContent}</body>
            </html>
          `);
          doc.close();

          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve(true);
          }, 1000);
        } else {
          resolve(false);
        }
      } catch (e) {
        console.error('Thermal print error:', e);
        resolve(false);
      }
    });
  }
}
