import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, PropertyType } from "@/types/properties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, Building2, Store, Trees } from "lucide-react";

export default function Imoveis() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'todas'>('todas');

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsyn1gs9yeHktxDsKFl7uKgcaL7hEDpaRwdl7NHhJuXeikMInhcxG0137fPiVYyZ5AwK98Ny66W8l2/pub?gid=195841533&single=true&output=csv";

  const categories = [
    { type: 'todas' as const, label: 'Todas', icon: Home, count: properties.length },
    { type: 'casa' as const, label: 'Casas', icon: Home, count: properties.filter(p => p.type === 'casa').length },
    { type: 'apartamento' as const, label: 'Apartamentos', icon: Building2, count: properties.filter(p => p.type === 'apartamento').length },
    { type: 'comercial' as const, label: 'Comercial', icon: Store, count: properties.filter(p => p.type === 'comercial').length },
    { type: 'terreno' as const, label: 'Terrenos', icon: Trees, count: properties.filter(p => p.type === 'terreno').length },
  ];

  const normalizePropertyType = (type: string): PropertyType => {
    switch (type.toLowerCase().trim()) {
      case 'casa': return 'casa';
      case 'apartamento': return 'apartamento';
      case 'comercial': return 'comercial';
      case 'area':
      case 'área':
      case 'lote':
      case 'rural':
      case 'terreno': return 'terreno';
      default: return 'casa';
    }
  };

  const parseCsvLine = (line: string) => {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (i > 0 && line[i-1] === '"') {
          currentValue = currentValue.slice(0, -1) + '"';
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values.map(value => value.replace(/^"(.*)"$/, '$1').trim());
  };

  const parseRenda = (rendaStr: string): number | null => {
    if (!rendaStr) return null;
    
    const value = rendaStr
      .replace(/R\$\s*/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .trim();
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const syncProperties = async () => {
    try {
      setSyncing(true);
      console.log('Iniciando sincronização...');

      const response = await fetch(SHEET_URL);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da planilha');
      }

      const csvText = await response.text();
      const rows = csvText.split('\n');
      const headers = parseCsvLine(rows[0]);
      
      console.log('Headers:', headers);
      
      const propertiesToInsert = rows.slice(1)
        .filter(row => row.trim()) // Remove linhas vazias
        .map(row => {
          const values = parseCsvLine(row);
          const propertyData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            propertyData[header.trim()] = values[index] || '';
          });
          
          return {
            type: normalizePropertyType(propertyData['TIPO DE IMÓVEL']),
            quantity: parseInt(propertyData['QUANTIDADE']) || 1,
            address: propertyData['ENDEREÇO'],
            income: parseRenda(propertyData['RENDA']),
            tenant: propertyData['LOCATÁRIO(A)'] || null,
            observations: propertyData['OBSERVAÇÕES'] || null,
            city: propertyData['CIDADE']
          };
        });

      const { error: insertError } = await supabase
        .from('properties')
        .insert(propertiesToInsert);

      if (insertError) {
        throw insertError;
      }

      await loadProperties();
      toast.success('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados da planilha');
    } finally {
      setSyncing(false);
    }
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalizedProperties = (data || []).map(property => ({
        ...property,
        type: normalizePropertyType(property.type)
      }));

      setProperties(normalizedProperties);
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

  const filteredProperties = selectedCategory === 'todas' 
    ? properties 
    : properties.filter(property => property.type === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Imóveis</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={syncProperties}
            disabled={syncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar com Planilha'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.type}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedCategory === category.type ? 'border-primary shadow-lg' : ''
            }`}
            onClick={() => setSelectedCategory(category.type)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <category.icon className="w-6 h-6" />
                <span className="text-2xl font-bold">{category.count}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <h3 className="font-medium">{category.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Carregando imóveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  {property.quantity > 1 && ` (${property.quantity})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Endereço:</strong> {property.address}</p>
                  <p><strong>Cidade:</strong> {property.city}</p>
                  {property.tenant && (
                    <p><strong>Locatário:</strong> {property.tenant}</p>
                  )}
                  {property.income !== null && (
                    <p><strong>Renda:</strong> R$ {property.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                  {property.observations && (
                    <p><strong>Observações:</strong> {property.observations}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
