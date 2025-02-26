
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, PropertyType, RawPropertyData } from "@/types/properties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Coins, Home, Store, Trees } from "lucide-react";

export default function Renda() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Função para calcular a renda total por tipo de imóvel
  const calculateIncomeByType = (type: string) => {
    return properties
      .filter(property => type === 'todas' || property.type === type)
      .reduce((total, property) => {
        const propertyIncome = 
          (property.income1_value || 0) + 
          (property.income2_value || 0) + 
          (property.income3_value || 0);
        return total + (propertyIncome * property.quantity);
      }, 0);
  };

  // Função para calcular o número de inquilinos por tipo de imóvel
  const calculateTenantsCountByType = (type: string) => {
    return properties
      .filter(property => type === 'todas' || property.type === type)
      .reduce((total, property) => {
        const tenantCount = [
          property.income1_tenant,
          property.income2_tenant,
          property.income3_tenant
        ].filter(tenant => tenant !== null).length;
        return total + (tenantCount * property.quantity);
      }, 0);
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedProperties: Property[] = (data as RawPropertyData[]).map(property => ({
        ...property,
        type: property.type as PropertyType
      }));

      setProperties(formattedProperties);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar os imóveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const categories = [
    { 
      type: 'todas', 
      label: 'Total', 
      icon: Coins,
      gradient: 'from-violet-500 to-violet-600',
      hoverGradient: 'hover:from-violet-600 hover:to-violet-700'
    },
    { 
      type: 'comercial', 
      label: 'Comercial', 
      icon: Store,
      gradient: 'from-amber-500 to-amber-600',
      hoverGradient: 'hover:from-amber-600 hover:to-amber-700'
    },
    { 
      type: 'casa', 
      label: 'Casa', 
      icon: Home,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
    },
    { 
      type: 'apartamento', 
      label: 'Apartamento', 
      icon: Building2,
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700'
    },
    { 
      type: 'area', 
      label: 'Área', 
      icon: Trees,
      gradient: 'from-cyan-500 to-cyan-600',
      hoverGradient: 'hover:from-cyan-600 hover:to-cyan-700'
    },
    { 
      type: 'lote', 
      label: 'Lote', 
      icon: Trees,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  // Função auxiliar para verificar se um imóvel tem alguma renda
  const hasIncome = (property: Property) => {
    return property.income1_value || property.income2_value || property.income3_value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando informações de renda...</p>
      </div>
    );
  }

  const filteredProperties = selectedType && selectedType !== 'todas'
    ? properties.filter(p => p.type === selectedType && hasIncome(p))
    : properties.filter(hasIncome);

  return (
    <div className="space-y-4 p-2 md:space-y-6 md:p-0">
      <h1 className="text-2xl md:text-3xl font-bold">Renda</h1>

      {/* Grid de categorias - Ajustado para melhor visualização mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {categories.map((category) => {
          const income = calculateIncomeByType(category.type);
          const tenantsCount = calculateTenantsCountByType(category.type);
          const Icon = category.icon;

          return (
            <Card 
              key={category.type}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                selectedType === category.type ? 'ring-2 ring-offset-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedType(
                selectedType === category.type ? null : category.type
              )}
            >
              <CardHeader className={`bg-gradient-to-br ${category.gradient} text-white rounded-t-lg p-3 md:p-6`}>
                <CardTitle className="flex items-center justify-between text-base md:text-lg">
                  <span>{category.label}</span>
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="text-lg md:text-2xl font-bold truncate">{formatCurrency(income)}</div>
                <p className="text-xs text-muted-foreground">
                  {tenantsCount} {tenantsCount === 1 ? 'inquilino' : 'inquilinos'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista detalhada de rendas por imóvel - Ajustada para mobile */}
      <div className="mt-4 md:mt-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
          {selectedType 
            ? `Imóveis ${categories.find(c => c.type === selectedType)?.label}`
            : 'Todos os Imóveis com Renda'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-base md:text-lg line-clamp-1">
                  {property.address}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="space-y-2">
                  {property.income1_value && property.income1_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-muted-foreground truncate pr-2">
                        {property.income1_tenant}
                      </span>
                      <span className="text-sm md:text-base font-medium">
                        {formatCurrency(property.income1_value)}
                      </span>
                    </div>
                  )}
                  {property.income2_value && property.income2_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-muted-foreground truncate pr-2">
                        {property.income2_tenant}
                      </span>
                      <span className="text-sm md:text-base font-medium">
                        {formatCurrency(property.income2_value)}
                      </span>
                    </div>
                  )}
                  {property.income3_value && property.income3_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-muted-foreground truncate pr-2">
                        {property.income3_tenant}
                      </span>
                      <span className="text-sm md:text-base font-medium">
                        {formatCurrency(property.income3_value)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm md:text-base font-bold">
                        {formatCurrency(
                          ((property.income1_value || 0) +
                           (property.income2_value || 0) +
                           (property.income3_value || 0)) * property.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
