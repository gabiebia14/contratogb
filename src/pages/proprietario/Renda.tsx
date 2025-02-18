
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { Building2, CheckCircle, XCircle } from "lucide-react";

const propertyData = [
  {
    id: 1,
    name: "Casa em Moema",
    monthlyIncome: 5000,
    hasContract: true,
    lastPayment: "2024-02-15",
    contractEnd: "2025-02-15"
  },
  {
    id: 2,
    name: "Sala Comercial",
    monthlyIncome: 3500,
    hasContract: true,
    lastPayment: "2024-02-10",
    contractEnd: "2024-08-10"
  }
];

const monthlyData = [
  { month: 'Jan', income: 8500 },
  { month: 'Fev', income: 8500 },
  { month: 'Mar', income: 8500 },
  { month: 'Abr', income: 8500 },
  { month: 'Mai', income: 5000 },
  { month: 'Jun', income: 5000 },
];

export default function Renda() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gestão de Renda</h1>
        <Select defaultValue="todos">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por imóvel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os imóveis</SelectItem>
            <SelectItem value="casa-moema">Casa em Moema</SelectItem>
            <SelectItem value="sala-comercial">Sala Comercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Renda Mensal Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#0EA5E9" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {propertyData.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#0EA5E9]" />
                {property.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Renda Mensal:</span>
                <span className="font-semibold">R$ {property.monthlyIncome}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contrato Ativo:</span>
                <div className="flex items-center gap-2">
                  {property.hasContract ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-700">Sim</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-700">Não</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Último Pagamento:</span>
                <span>{new Date(property.lastPayment).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fim do Contrato:</span>
                <span>{new Date(property.contractEnd).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
