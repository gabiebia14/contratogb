
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Warehouse, TreePine } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";

const propertyIcons = {
  casa: Home,
  apartamento: Building2,
  comercial: Warehouse,
  rural: TreePine,
  terreno: TreePine
};

const propertyColors = {
  casa: 'text-blue-600',
  apartamento: 'text-green-600',
  comercial: 'text-yellow-600',
  rural: 'text-purple-600',
  terreno: 'text-orange-600'
};

export default function Dashboard() {
  const [period, setPeriod] = useState('6m');
  const { stats, incomeByProperty, isLoading } = useProperties();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Carregando dados...</p>
      </div>
    );
  }

  const propertyCards = Object.entries(stats.byType || {}).map(([type, quantity]) => ({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    value: quantity,
    icon: propertyIcons[type as keyof typeof propertyIcons] || Building2,
    color: propertyColors[type as keyof typeof propertyColors] || 'text-gray-600'
  }));

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
            <div className="text-2xl font-bold">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Desocupados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vacant}</div>
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
              <BarChart data={incomeByProperty}>
                <XAxis dataKey="imovel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receita" fill="#4F46E5" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Receita Total: R$ {stats.totalIncome.toLocaleString('pt-BR')}</CardTitle>
            <div className="space-x-2">
              <Button 
                variant={period === '6m' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setPeriod('6m')}
              >
                6M
              </Button>
              <Button 
                variant={period === '1y' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setPeriod('1y')}
              >
                1A
              </Button>
              <Button 
                variant={period === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setPeriod('all')}
              >
                Tudo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeByProperty}>
                <XAxis dataKey="imovel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
