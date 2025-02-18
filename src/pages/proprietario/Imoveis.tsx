
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Home, MapPin, FileText, History, DollarSign } from "lucide-react";

const properties = [
  {
    id: 1,
    title: "Casa em Moema",
    type: "casa",
    address: "Alameda dos Anapurus, 1000",
    price: "R$ 850.000",
    status: "Ocupado",
    documents: 5,
    changes: 12
  },
  {
    id: 2,
    title: "Sala Comercial",
    type: "comercial",
    address: "Av. Paulista, 1000",
    price: "R$ 450.000",
    status: "Desocupado",
    documents: 3,
    changes: 8
  }
];

export default function Imoveis() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Meus Imóveis</h1>
        <Select defaultValue="todos">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="casa">Casas</SelectItem>
            <SelectItem value="apartamento">Apartamentos</SelectItem>
            <SelectItem value="comercial">Comerciais</SelectItem>
            <SelectItem value="rural">Rurais</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {property.type === "casa" ? (
                  <Home className="h-5 w-5 text-[#0EA5E9]" />
                ) : (
                  <Building2 className="h-5 w-5 text-[#F97316]" />
                )}
                {property.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.address}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0EA5E9]" />
                  <span className="text-sm">{property.documents} docs</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#F97316]" />
                  <span className="text-sm">{property.changes} alterações</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{property.price}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  property.status === "Ocupado" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {property.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
