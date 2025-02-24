
import { useEffect, useState } from "react";
import { Property, PropertyType } from "@/types/properties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Building2, Store, Trees } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyCategoryCard } from "../components/PropertyCategoryCard";
import { SyncPropertiesButton } from "../components/SyncPropertiesButton";

export default function Imoveis() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PropertyType | 'todas'>('todas');

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsyn1gs9yeHktxDsKFl7uKgcaL7hEDpaRwdl7NHhJuXeikMInhcxG0137fPiVYyZ5AwK98Ny66W8l2/pub?gid=195841533&single=true&output=csv";

  const categories = [
    { type: 'todas' as const, label: 'Todas', icon: Home, count: properties.length },
    { type: 'comercial' as const, label: 'Comercial', icon: Store, count: properties.filter(p => p.type === 'comercial').length },
    { type: 'casa' as const, label: 'Casa', icon: Home, count: properties.filter(p => p.type === 'casa').length },
    { type: 'apartamento' as const, label: 'Apartamento', icon: Building2, count: properties.filter(p => p.type === 'apartamento').length },
    { type: 'terreno' as const, label: 'Terreno', icon: Trees, count: properties.filter(p => p.type === 'terreno').length },
  ];

  const normalizePropertyType = (type: string): PropertyType => {
    switch (type.toLowerCase().trim()) {
      case 'comercial':
        return 'comercial';
      case 'casa':
        return 'casa';
      case 'apartamento':
        return 'apartamento';
      case 'area':
      case 'área':
      case 'lote':
      case 'terreno':
        return 'terreno';
      default:
        console.warn(`Tipo de imóvel não reconhecido: ${type}, usando 'terreno' como padrão`);
        return 'terreno';
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
        .filter(row => row.trim())
        .map(row => {
          const values = parseCsvLine(row);
          const propertyData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            propertyData[header.trim()] = values[index] || '';
          });

          const incomes = [];
          
          const renda1 = parseRenda(propertyData['RENDA 1 (VALOR)']);
          if (renda1 !== null) {
            incomes.push({
              value: renda1,
              tenant: propertyData['RENDA 1 (INQUILINO)'] || 'Não informado'
            });
          }

          const renda2 = parseRenda(propertyData['RENDA 2 (VALOR)']);
          if (renda2 !== null) {
            incomes.push({
              value: renda2,
              tenant: propertyData['RENDA 2 (INQUILINO)'] || 'Não informado'
            });
          }

          const renda3 = parseRenda(propertyData['RENDA 3(VALOR)']);
          if (renda3 !== null) {
            incomes.push({
              value: renda3,
              tenant: propertyData['RENDA3 (INQUILINO)'] || 'Não informado'
            });
          }
          
          return {
            type: normalizePropertyType(propertyData['TIPO DE IMÓVEL']),
            quantity: parseInt(propertyData['QUANTIDADE']) || 1,
            address: propertyData['ENDEREÇO'],
            incomes: incomes,
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
        type: normalizePropertyType(property.type),
        incomes: Array.isArray(property.incomes) 
          ? property.incomes.map((income: any) => ({
              value: Number(income.value),
              tenant: String(income.tenant)
            }))
          : []
      })) as Property[];

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
          <SyncPropertiesButton onSync={syncProperties} isSyncing={syncing} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <PropertyCategoryCard
            key={category.type}
            type={category.type}
            label={category.label}
            icon={category.icon}
            count={category.count}
            isSelected={selectedCategory === category.type}
            onClick={() => setSelectedCategory(category.type)}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Carregando imóveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
