
import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Home } from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Casa em Moema",
    type: "casa",
    address: "Alameda dos Anapurus, 1000",
    lat: -23.6019,
    lng: -46.6599
  },
  {
    id: 2,
    name: "Sala Comercial",
    type: "comercial",
    address: "Av. Paulista, 1000",
    lat: -23.5653,
    lng: -46.6545
  }
];

export default function MapaImoveis() {
  return (
    <div className="h-[calc(100vh-8rem)] p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Mapa de Imóveis</h1>
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

      <div className="grid md:grid-cols-[300px,1fr] gap-6 h-full">
        <div className="space-y-4 overflow-auto">
          {properties.map((property) => (
            <Card key={property.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                {property.type === "casa" ? (
                  <Home className="h-5 w-5 text-[#0EA5E9] mt-1" />
                ) : (
                  <Building2 className="h-5 w-5 text-[#F97316] mt-1" />
                )}
                <div>
                  <h3 className="font-semibold">{property.name}</h3>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="relative">
          <div className="absolute inset-0 bg-gray-100 rounded-lg">
            {/* Aqui será integrado o mapa - por enquanto é apenas um placeholder */}
            <div className="h-full flex items-center justify-center text-gray-500">
              Mapa será carregado aqui
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
