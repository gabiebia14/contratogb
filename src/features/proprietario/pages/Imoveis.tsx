
import { useState, useEffect } from "react";
import { PropertyType } from "@/types/properties";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyCategories } from "../components/PropertyCategories";
import { SyncPropertiesButton } from "../components/SyncPropertiesButton";
import { useProperties } from "../hooks/useProperties";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Imoveis() {
  const { properties, loading, syncing, loadProperties, syncProperties } = useProperties();
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'todas'>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const filteredProperties = properties
    .filter(property => 
      selectedCategory === 'todas' || property.type === selectedCategory
    )
    .filter(property => 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-4 p-2 md:space-y-6 md:p-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Imóveis</h1>
        <div className="flex gap-2">
          <SyncPropertiesButton onSync={syncProperties} isSyncing={syncing} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por endereço ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <PropertyCategories
          properties={properties}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

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

      {!loading && filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg text-gray-500">Nenhum imóvel encontrado</p>
          <p className="text-sm text-gray-400">Tente ajustar seus filtros de busca</p>
        </div>
      )}
    </div>
  );
}
