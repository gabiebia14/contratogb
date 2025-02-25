
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
  income_type: string | null;
  observations: string | null;
  income1_value: number | null;
  income1_tenant: string | null;
  income2_value: number | null;
  income2_tenant: string | null;
  income3_value: number | null;
  income3_tenant: string | null;
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
  income_type: string | null;
  observations: string | null;
  income1_value: number | null;
  income1_tenant: string | null;
  income2_value: number | null;
  income2_tenant: string | null;
  income3_value: number | null;
  income3_tenant: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}
