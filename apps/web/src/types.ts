export type Supplier = {
  id: string;
  displayName: string;
  logoUrl?: string;
  regions: string[];
  city?: string;
  verified?: boolean;
  rating?: number;
  badges?: string[];
  categories?: string[];
  products?: string[];
  about?: string;
  warehouseAddress?: string;
  contacts?: {
    phone?: string;
    whatsapp?: string;
    tg?: string;             // @handle или https://t.me/...
    email?: string;
    website?: string;
  };
  gallery?: string[];        // /gallery/supX-001.webp…
  priceList?: { url: string }; // <— ВАЖНО: добавлено
  docs?: {
    mercury?: { status?: "linked"; orgId?: string };
    chestnyZnak?: { status?: "linked"; companyId?: string };
  };
};

export type Listing = {
  id: string;
  supplierId: string;
  title: string;
  packaging?: string[];
  batchVolumeKg: number;
  pricePerKgRUB: number;
  region: string;
  terms?: string[];
  photos?: string[];
  shelfLifeDays?: number | null;
  tempRegime?: string;
  status?: "pending" | "approved" | "rejected";
  badges?: string[];
  createdAt?: string;
  __category?: "Красная икра" | "Краб" | "Рыба/морепродукты";
};
