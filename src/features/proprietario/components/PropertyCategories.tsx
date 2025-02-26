
import { Home, Building2, Store, Trees } from "lucide-react";
import { Property, PropertyType } from "@/types/properties";
import { PropertyCategoryCard } from "./PropertyCategoryCard";
import { calculateTotalQuantityByType } from "../utils/propertyUtils";

interface PropertyCategoriesProps {
  properties: Property[];
  selectedCategory: PropertyType | 'todas';
  onCategorySelect: (category: PropertyType | 'todas') => void;
}

const categories = [
  { 
    type: 'todas' as const, 
    label: 'Todas', 
    icon: Home,
    gradient: "from-gray-500 to-gray-600"
  },
  { 
    type: 'comercial' as const, 
    label: 'Comercial', 
    icon: Store,
    gradient: "from-emerald-500 to-emerald-600"
  },
  { 
    type: 'casa' as const, 
    label: 'Casa', 
    icon: Home,
    gradient: "from-blue-500 to-blue-600"
  },
  { 
    type: 'apartamento' as const, 
    label: 'Apartamento', 
    icon: Building2,
    gradient: "from-purple-500 to-purple-600"
  },
  { 
    type: 'area' as const, 
    label: 'Área', 
    icon: Trees,
    gradient: "from-amber-500 to-amber-600"
  },
  { 
    type: 'lote' as const, 
    label: 'Lote', 
    icon: Trees,
    gradient: "from-orange-500 to-orange-600"
  }
];

export function PropertyCategories({ 
  properties, 
  selectedCategory, 
  onCategorySelect 
}: PropertyCategoriesProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-4">
      {categories.map((category) => (
        <PropertyCategoryCard
          key={category.type}
          type={category.type}
          label={category.label}
          icon={category.icon}
          gradient={category.gradient}
          count={calculateTotalQuantityByType(properties, category.type)}
          isSelected={selectedCategory === category.type}
          onClick={() => onCategorySelect(category.type)}
        />
      ))}
    </div>
  );
}
