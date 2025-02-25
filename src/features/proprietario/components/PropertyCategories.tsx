
import { Home, Building2, Store, Trees } from "lucide-react";
import { Property, PropertyType } from "@/types/properties";
import { PropertyCategoryCard } from "./PropertyCategoryCard";
import { calculateTotalQuantityByType } from "../utils/propertyUtils";

interface PropertyCategoriesProps {
  properties: Property[];
  selectedCategory: PropertyType | 'todas';
  onCategorySelect: (category: PropertyType | 'todas') => void;
}

export function PropertyCategories({ 
  properties, 
  selectedCategory, 
  onCategorySelect 
}: PropertyCategoriesProps) {
  const categories = [
    { 
      type: 'todas' as const, 
      label: 'Todas', 
      icon: Home, 
      count: calculateTotalQuantityByType(properties, 'todas')
    },
    { 
      type: 'comercial' as const, 
      label: 'Comercial', 
      icon: Store, 
      count: calculateTotalQuantityByType(properties, 'comercial')
    },
    { 
      type: 'casa' as const, 
      label: 'Casa', 
      icon: Home, 
      count: calculateTotalQuantityByType(properties, 'casa')
    },
    { 
      type: 'apartamento' as const, 
      label: 'Apartamento', 
      icon: Building2, 
      count: calculateTotalQuantityByType(properties, 'apartamento')
    },
    { 
      type: 'area' as const, 
      label: 'Área', 
      icon: Trees, 
      count: calculateTotalQuantityByType(properties, 'area')
    },
    { 
      type: 'lote' as const, 
      label: 'Lote', 
      icon: Trees, 
      count: calculateTotalQuantityByType(properties, 'lote')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <PropertyCategoryCard
          key={category.type}
          type={category.type}
          label={category.label}
          icon={category.icon}
          count={category.count}
          isSelected={selectedCategory === category.type}
          onClick={() => onCategorySelect(category.type)}
        />
      ))}
    </div>
  );
}
