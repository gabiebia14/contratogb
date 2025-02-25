import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, TreePine, Warehouse } from "lucide-react";
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

  const propertyCards = [
    { title: 'Casas', value: propertyStats.houses, icon: Home, color: 'text-blue-600' },
    { title: 'Apartamentos', value: propertyStats.apartments, icon: Building2, color: 'text-green-600' },
    { title: 'Comerciais', value: propertyStats.commercial, icon: Warehouse, color: 'text-yellow-600' },
    { title: 'Áreas', value: propertyStats.areas, icon: TreePine, color: 'text-emerald-600' },
    { title: 'Lotes', value: propertyStats.lotes, icon: TreePine, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Visão Geral dos Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Imóveis</p>
              <p className="text-2xl font-bold text-primary">{occupancyStats.total}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ocupados</p>
              <p className="text-2xl font-bold text-green-600">{occupancyStats.occupied}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Desocupados</p>
              <p className="text-2xl font-bold text-red-600">{occupancyStats.vacant}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {propertyCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

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
