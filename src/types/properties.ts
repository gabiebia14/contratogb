
export type PropertyType = 'casa' | 'apartamento' | 'comercial' | 'terreno';

export interface Property {
  id: string;
  type: PropertyType;
  quantity: number;
  address: string;
  income: number | null;
  tenant: string | null;
  observations: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyImport {
  'TIPO DE IMÓVEL': string;
  'QUANTIDADE': string;
  'ENDEREÇO': string;
  'RENDA': string;
  'LOCATÁRIO(A)': string;
  'OBSERVAÇÕES': string;
  'CIDADE': string;
}
