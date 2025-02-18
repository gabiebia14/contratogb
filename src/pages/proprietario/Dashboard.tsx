
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Warehouse, Trees, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const revenueData = [
  { name: 'Casa 1', online: 4000, offline: 2400, agente: 2400, marketing: 1000 },
  { name: 'Apto 1', online: 3000, offline: 1398, agente: 2210, marketing: 800 },
  { name: 'Com 1', online: 2000, offline: 9800, agente: 2290, marketing: 1200 },
  { name: 'Rural 1', online: 2780, offline: 3908, agente: 2000, marketing: 900 },
];

const monthlyData = [
  { name: 'Jan', valor: 4000 },
  { name: 'Fev', valor: 3000 },
  { name: 'Mar', valor: 2000 },
  { name: 'Abr', valor: 2780 },
  { name: 'Mai', valor: 1890 },
  { name: 'Jun', valor: 2390 },
];

const propertyTypes = [
  { title: "Casas", value: 12, icon: Home, color: "text-[#0EA5E9]" },
  { title: "Comerciais", value: 8, icon: Building2, color: "text-[#F97316]" },
  { title: "Apartamentos", value: 15, icon: Building2, color: "text-[#0EA5E9]" },
  { title: "Rurais", value: 3, icon: Trees, color: "text-[#F97316]" },
];

const occupancyStats = [
  { title: "Ocupados", value: 28, icon: Users, color: "text-green-500" },
  { title: "Desocupados", value: 10, icon: Building2, color: "text-red-500" },
];

export default function ProprietarioDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {propertyTypes.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <h2 className="text-3xl font-bold">{item.value}</h2>
              </div>
              <item.icon className={`h-8 w-8 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="online" fill="#0EA5E9" stackId="a" />
                  <Bar dataKey="offline" fill="#F97316" stackId="a" />
                  <Bar dataKey="agente" fill="#6366F1" stackId="a" />
                  <Bar dataKey="marketing" fill="#EC4899" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Receita Mensal Total</CardTitle>
            <Select defaultValue="2024">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#0EA5E9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {occupancyStats.map((item) => (
          <Card key={item.title}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <h2 className="text-3xl font-bold">{item.value}</h2>
              </div>
              <item.icon className={`h-8 w-8 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
