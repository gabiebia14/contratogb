
export type PropertyType = 'casa' | 'apartamento' | 'comercial' | 'area' | 'lote';

export interface RentalIncome {
  value: number;
  tenant: string;
}

export interface Property {
  id: string;
  type: PropertyType;
  quantity: number;
  address: string;
  incomes: RentalIncome[];
  observations: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}

// Type for raw Supabase data
export interface RawPropertyData {
  id: string;
  type: string;
  quantity: number;
  address: string;
  incomes: Array<{ value: number | string; tenant: string; }>;
  observations: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}
