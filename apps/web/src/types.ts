export type Plan = 'lite' | 'pro' | 'vip' | null;

export type PriceList =
  | { type: 'pdf'; url: string }
  | { type: 'text'; text: string };

export type Supplier = {
  id: string;
  displayName: string;
  logoUrl?: string;
  regions: string[];
  city?: string;
  verified?: boolean;
  rating?: number;
  badges?: string[];

  about?: string;
  categories?: string[];
  products?: string[];
  warehouseAddress?: string;
  contacts?: {
    phone?: string;
    email?: string;
    tg?: string;
    website?: string;
  };
  gallery?: string[];
  moqMinKg?: number | null;
  priceList?: PriceList | null;

  docs?: {
    mercury?: { status?: 'linked'|'pending'|'not_linked'; orgId?: string; lastSyncAt?: string };
    chestnyZnak?: { status?: 'linked'|'pending'|'not_linked'; companyId?: string; lastSyncAt?: string };
    tu?: { number: string; issuedAt?: string; expiresAt?: string|null; status?: 'valid'|'pending'|'expired' }[];
  };
};

export type Listing = {
  id: string;
  supplierId: string;
  title: string;
  grade?: string;
  fishSpecies?: string;
  tu?: string | null;
  packaging: string[];
  batchVolumeKg: number;
  pricePerKgRUB: number;
  region: string;
  terms?: string[];
  photos: string[];
  shelfLifeDays?: number | null;
  tempRegime?: string;
  status?: 'pending'|'approved'|'rejected'|'approved';
  createdAt: string;
  badges?: string[];
  __category?: 'Красная икра'|'Краб'|'Рыба/морепродукты';
};
