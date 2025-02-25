
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, TreePine, Warehouse, DollarSign, Building } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property, PropertyType, RawPropertyData } from "@/types/properties";
import { toast } from "sonner";

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizePropertyType = (type: string): PropertyType => {
    switch (type.toLowerCase().trim()) {
      case 'casa': return 'casa';
      case 'apartamento': return 'apartamento';
      case 'comercial': return 'comercial';
      case 'area':
      case 'área': return 'area';
      case 'lote': return 'lote';
      default: return 'casa';
    }
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalizedProperties = (data as RawPropertyData[]).map(property => ({
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

  const propertyStats = {
    houses: properties.filter(p => p.type === 'casa').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    apartments: properties.filter(p => p.type === 'apartamento').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    commercial: properties.filter(p => p.type === 'comercial').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    areas: properties.filter(p => p.type === 'area').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    lotes: properties.filter(p => p.type === 'lote').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
  };

  const hasIncome = (property: Property) => {
    return property.income1_value || property.income2_value || property.income3_value;
  };

  const occupancyStats = {
    total: properties.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    occupied: properties.filter(hasIncome).reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    vacant: properties.filter(p => !hasIncome(p)).reduce((acc, curr) => acc + (curr.quantity || 1), 0)
  };

  const calculatePropertyIncome = (property: Property) => {
    return ((property.income1_value || 0) + 
            (property.income2_value || 0) + 
            (property.income3_value || 0)) * property.quantity;
  };

  const totalIncome = properties.reduce((acc, property) => {
    return acc + calculatePropertyIncome(property);
  }, 0);

  const revenueByType = [
    {
      tipo: 'Casa',
      renda: properties
        .filter(p => p.type === 'casa')
        .reduce((acc, p) => acc + calculatePropertyIncome(p), 0)
    },
    {
      tipo: 'Apartamento',
      renda: properties
        .filter(p => p.type === 'apartamento')
        .reduce((acc, p) => acc + calculatePropertyIncome(p), 0)
    },
    {
      tipo: 'Comercial',
      renda: properties
        .filter(p => p.type === 'comercial')
        .reduce((acc, p) => acc + calculatePropertyIncome(p), 0)
    },
    {
      tipo: 'Área',
      renda: properties
        .filter(p => p.type === 'area')
        .reduce((acc, p) => acc + calculatePropertyIncome(p), 0)
    },
    {
      tipo: 'Lote',
      renda: properties
        .filter(p => p.type === 'lote')
        .reduce((acc, p) => acc + calculatePropertyIncome(p), 0)
    }
  ].sort((a, b) => b.renda - a.renda);

  const COLORS = {
    'Casa': '#4F46E5',
    'Apartamento': '#10B981',
    'Comercial': '#F59E0B',
    'Área': '#06B6D4',
    'Lote': '#8B5CF6'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRevenue = revenueByType.reduce((acc, item) => acc + item.renda, 0);

  const propertyCategories = [
    { 
      title: 'Casas', 
      value: propertyStats.houses, 
      icon: Home, 
      color: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-200'
    },
    { 
      title: 'Apartamentos', 
      value: propertyStats.apartments, 
      icon: Building2, 
      color: 'bg-green-100 text-green-700',
      borderColor: 'border-green-200'
    },
    { 
      title: 'Comerciais', 
      value: propertyStats.commercial, 
      icon: Warehouse, 
      color: 'bg-yellow-100 text-yellow-700',
      borderColor: 'border-yellow-200'
    },
    { 
      title: 'Áreas', 
      value: propertyStats.areas, 
      icon: TreePine, 
      color: 'bg-emerald-100 text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    { 
      title: 'Lotes', 
      value: propertyStats.lotes, 
      icon: TreePine, 
      color: 'bg-purple-100 text-purple-700',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* New Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Total de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{occupancyStats.total}</div>
            <p className="text-blue-100 mt-2">
              {occupancyStats.occupied} ocupados • {occupancyStats.vacant} vagos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Renda Total Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-green-100 mt-2">
              Média por imóvel: {formatCurrency(totalIncome / occupancyStats.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Updated Property Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {propertyCategories.map((category) => (
          <Card 
            key={category.title}
            className={`border-2 ${category.borderColor}`}
          >
            <CardContent className={`${category.color} p-6 rounded-lg flex flex-col items-center justify-center space-y-2`}>
              <category.icon className="h-8 w-8" />
              <h3 className="font-semibold text-lg">{category.title}</h3>
              <p className="text-3xl font-bold">{category.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Receita por Tipo de Imóvel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Faturamento Total: {formatCurrency(totalRevenue)}
            </p>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByType}
                  dataKey="renda"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const percent = ((value / totalRevenue) * 100).toFixed(1);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORS[revenueByType[index].tipo as keyof typeof COLORS]}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs"
                      >
                        {`${percent}%`}
                      </text>
                    );
                  }}
                >
                  {revenueByType.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.tipo as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
