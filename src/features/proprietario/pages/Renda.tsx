
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Renda</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <CardHeader className={`bg-gradient-to-br ${category.gradient} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.label}</span>
                  <Icon className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{formatCurrency(income)}</div>
                <p className="text-xs text-muted-foreground">
                  {tenantsCount} {tenantsCount === 1 ? 'inquilino' : 'inquilinos'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista detalhada de rendas por imóvel */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedType 
            ? `Imóveis ${categories.find(c => c.type === selectedType)?.label}`
            : 'Todos os Imóveis com Renda'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle className="text-lg">{property.address}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {property.income1_value && property.income1_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{property.income1_tenant}</span>
                      <span className="font-medium">{formatCurrency(property.income1_value)}</span>
                    </div>
                  )}
                  {property.income2_value && property.income2_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{property.income2_tenant}</span>
                      <span className="font-medium">{formatCurrency(property.income2_value)}</span>
                    </div>
                  )}
                  {property.income3_value && property.income3_tenant && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{property.income3_tenant}</span>
                      <span className="font-medium">{formatCurrency(property.income3_value)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <span className="font-bold">
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
