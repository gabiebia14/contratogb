
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Warehouse, TreePine } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Dados de exemplo - em um caso real, viriam de uma API
const propertyData = {
  houses: 12,
  apartments: 8,
  commercial: 5,
  rural: 3,
  occupied: 23,
  vacant: 5
};

const monthlyRevenue = [
  { month: 'Jan', receita: 45000 },
  { month: 'Fev', receita: 42000 },
  { month: 'Mar', receita: 48000 },
  { month: 'Abr', receita: 51000 },
  { month: 'Mai', receita: 53000 },
  { month: 'Jun', receita: 49000 },
];

const revenueByProperty = [
  { imovel: 'Ed. Central', online: 4500, offline: 2000, agente: 1500, marketing: 800 },
  { imovel: 'Casa Jardins', online: 3800, offline: 2200, agente: 1200, marketing: 600 },
  { imovel: 'Sala Corp.', online: 5200, offline: 1800, agente: 2000, marketing: 1000 },
  { imovel: 'Apto. Park', online: 4200, offline: 2500, agente: 1800, marketing: 900 },
];

const propertyCards = [
  { title: 'Casas', value: propertyData.houses, icon: Home, color: 'text-blue-600' },
  { title: 'Apartamentos', value: propertyData.apartments, icon: Building2, color: 'text-green-600' },
  { title: 'Comerciais', value: propertyData.commercial, icon: Warehouse, color: 'text-yellow-600' },
  { title: 'Rurais', value: propertyData.rural, icon: TreePine, color: 'text-purple-600' },
];

export default function Dashboard() {
  const [period, setPeriod] = useState('6m'); // 6m, 1y, all

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
            <div className="text-2xl font-bold">{propertyData.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Desocupados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyData.vacant}</div>
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
                <Bar dataKey="online" fill="#4F46E5" name="Online" />
                <Bar dataKey="offline" fill="#10B981" name="Offline" />
                <Bar dataKey="agente" fill="#F59E0B" name="Agente" />
                <Bar dataKey="marketing" fill="#EC4899" name="Marketing" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Receita Mensal Total</CardTitle>
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
              <LineChart data={monthlyRevenue}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Receita Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
