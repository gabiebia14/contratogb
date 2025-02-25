
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

export interface PropertyImport {
  'TIPO DE IMÓVEL': string;
  'QUANTIDADE': string;
  'ENDEREÇO': string;
  'TIPO DE RENDA': string;
  'OBSERVAÇÕES': string;
  'RENDA 1 (VALOR)': string;
  'RENDA 1 (INQUILINO)': string;
  'RENDA 2 (VALOR)': string;
  'RENDA 2 (INQUILINO)': string;
  'RENDA 3(VALOR)': string;
  'RENDA3 (INQUILINO)': string;
  'CIDADE': string;
}
