
export type PropertyType = 'casa' | 'apartamento' | 'comercial' | 'rural' | 'terreno';

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
