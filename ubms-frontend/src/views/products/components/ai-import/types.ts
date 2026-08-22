export interface TableProductItem {
  _id?: string;          // Stable v-for key uchun
  id?: string;
  name: string;
  categoryName?: string;
  unitName?: string;
  packaging?: string;    // Blok, Dona, Quti, Pachka
  volume?: string;       // 1.5L, 1L, 0.5L, 500g
  quantityPerPack?: number; // 6 ta, 12 ta, 24 ta
  purchasePrice?: number;
  salePrice: number;
  initialStock?: number;
  minStock?: number;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
  status?: string;
}

export interface QuickPromptChip {
  iconComponent: any;
  title: string;
  text: string;
}

export interface CatalogTemplate {
  id: string;
  title: string;
  description: string;
  icon?: string;
  categoryName?: string;
  products: TableProductItem[];
}

