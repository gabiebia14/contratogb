
import { Property, PropertyType } from "@/types/properties";

export const normalizePropertyType = (type: string): PropertyType => {
  switch (type.toLowerCase().trim()) {
    case 'comercial':
      return 'comercial';
    case 'casa':
      return 'casa';
    case 'apartamento':
      return 'apartamento';
    case 'area':
    case 'área':
      return 'area';
    case 'lote':
      return 'lote';
    default:
      console.warn(`Tipo de imóvel não reconhecido: ${type}, usando 'casa' como padrão`);
      return 'casa';
  }
};

export const calculateTotalQuantityByType = (properties: Property[], propertyType: PropertyType | 'todas') => {
  if (propertyType === 'todas') {
    return properties.reduce((acc, property) => acc + property.quantity, 0);
  }
  return properties
    .filter(property => property.type === propertyType)
    .reduce((acc, property) => acc + property.quantity, 0);
};
