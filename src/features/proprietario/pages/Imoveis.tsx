
import { useState, useEffect } from "react";
import { PropertyType } from "@/types/properties";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyCategories } from "../components/PropertyCategories";
import { SyncPropertiesButton } from "../components/SyncPropertiesButton";
import { useProperties } from "../hooks/useProperties";

export default function Imoveis() {
  const { properties, loading, syncing, loadProperties, syncProperties } = useProperties();
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'todas'>('todas');

  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = selectedCategory === 'todas' 
    ? properties 
    : properties.filter(property => property.type === selectedCategory);

  return (
    <div className="space-y-4 p-2 md:space-y-6 md:p-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Imóveis</h1>
        <div className="flex gap-2">
          <SyncPropertiesButton onSync={syncProperties} isSyncing={syncing} />
        </div>
      </div>

      <PropertyCategories
        properties={properties}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Carregando imóveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
