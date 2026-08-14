import * as fs from 'fs';
import * as path from 'path';

export interface BusinessTypeConfig {
  type: string;
  label: string;
  desc: string;
  iconName: string;
  isEnabled: boolean;
}

export const DEFAULT_BUSINESS_TYPES: BusinessTypeConfig[] = [
  { type: 'shop', label: "Do'kon", desc: 'Chakana savdo, ombor va kassa', iconName: 'ShoppingBag', isEnabled: true },
  { type: 'restaurant', label: 'Restoran', desc: 'Stollar, ofitsiant va oshxona', iconName: 'UtensilsCrossed', isEnabled: true },
  { type: 'cafe', label: 'Kafe / Fastfood', desc: 'Tezkor buyurtma va kassa', iconName: 'Coffee', isEnabled: true },
  { type: 'barbershop', label: 'Sartaroshxona', desc: 'Ustalarning bandlik jadvali', iconName: 'Scissors', isEnabled: true },
  { type: 'pharmacy', label: 'Dorixona', desc: 'Partiya va muddat nazorati', iconName: 'Pill', isEnabled: true },
  { type: 'service', label: "Xizmat ko'rsatish", desc: 'Universal buyurtma va xizmat', iconName: 'Wrench', isEnabled: true },
];

const CONFIG_PATH = path.join(process.cwd(), 'business-types.config.json');

export function getBusinessTypesConfig(): BusinessTypeConfig[] {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return DEFAULT_BUSINESS_TYPES.map((def) => {
          const found = parsed.find((p: any) => p.type === def.type);
          return found ? { ...def, isEnabled: found.isEnabled !== false } : def;
        });
      }
    }
  } catch (err) {
    console.error('Error reading business types config:', err);
  }
  return DEFAULT_BUSINESS_TYPES;
}

export function saveBusinessTypesConfig(configs: BusinessTypeConfig[]): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(configs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving business types config:', err);
  }
}

export function toggleBusinessTypeConfig(type: string, isEnabled?: boolean): BusinessTypeConfig[] {
  const current = getBusinessTypesConfig();
  const updated = current.map((c) => {
    if (c.type === type) {
      return {
        ...c,
        isEnabled: isEnabled !== undefined ? isEnabled : !c.isEnabled,
      };
    }
    return c;
  });
  saveBusinessTypesConfig(updated);
  return updated;
}
