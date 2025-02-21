
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Warehouse, TreePine } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/properties";
import { toast } from "sonner";

export default function Dashboard() {
  const [period, setPeriod] = useState('6m');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar os imóveis
  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProperties(data || []);
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

  // Calculando as estatísticas dos imóveis
  const propertyStats = {
    houses: properties.filter(p => p.type === 'casa').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    apartments: properties.filter(p => p.type === 'apartamento').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    commercial: properties.filter(p => p.type === 'comercial').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    rural: properties.filter(p => p.type === 'rural').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    terrenos: properties.filter(p => p.type === 'terreno').reduce((acc, curr) => acc + (curr.quantity || 1), 0),
  };

  // Calculando imóveis ocupados e desocupados
  const occupancyStats = {
    occupied: properties.filter(p => p.tenant).length,
    vacant: properties.filter(p => !p.tenant).length
  };

  // Dados para os cards de tipo de imóvel
  const propertyCards = [
    { title: 'Casas', value: propertyStats.houses, icon: Home, color: 'text-blue-600' },
    { title: 'Apartamentos', value: propertyStats.apartments, icon: Building2, color: 'text-green-600' },
    { title: 'Comerciais', value: propertyStats.commercial, icon: Warehouse, color: 'text-yellow-600' },
    { title: 'Rurais', value: propertyStats.rural, icon: TreePine, color: 'text-purple-600' },
  ];

  // Calculando receita por imóvel
  const revenueByProperty = properties
    .filter(p => p.income)
    .map(p => ({
      imovel: p.address.length > 20 ? p.address.substring(0, 20) + '...' : p.address,
      renda: p.income || 0
    }))
    .slice(0, 5); // Pegando apenas os 5 primeiros para não sobrecarregar o gráfico

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Property Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Occupancy Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Ocupados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyStats.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Desocupados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyStats.vacant}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Receita por Imóvel</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByProperty}>
                <XAxis dataKey="imovel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="renda" fill="#4F46E5" name="Renda Mensal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
