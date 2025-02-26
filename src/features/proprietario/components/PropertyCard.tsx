
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/properties";
import { Building2, Home, Store, Trees } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

const typeConfig = {
  casa: {
    icon: Home,
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  apartamento: {
    icon: Building2,
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  comercial: {
    icon: Store,
    gradient: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
  },
  area: {
    icon: Trees,
    gradient: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
  },
  lote: {
    icon: Trees,
    gradient: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
};

export function PropertyCard({ property }: PropertyCardProps) {
  const totalIncome = (property.income1_value || 0) + 
                     (property.income2_value || 0) + 
                     (property.income3_value || 0);

  const config = typeConfig[property.type as keyof typeof typeConfig];
  const Icon = config?.icon || Building2;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className={`p-3 md:p-4 bg-gradient-to-br ${config?.gradient} text-white`}>
        <CardTitle className="text-base md:text-lg flex justify-between items-center">
          <span className="capitalize">{property.type}</span>
          <Icon className="h-5 w-5" />
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-3 md:p-4 ${config?.bgColor}`}>
        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium line-clamp-1">{property.address}</p>
            <p className="text-xs text-muted-foreground">{property.city}</p>
          </div>

          {totalIncome > 0 && (
            <div className="space-y-1 pt-2 border-t">
              {property.income1_value && property.income1_tenant && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate pr-2">
                    {property.income1_tenant}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(property.income1_value)}
                  </span>
                </div>
              )}
              {property.income2_value && property.income2_tenant && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate pr-2">
                    {property.income2_tenant}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(property.income2_value)}
                  </span>
                </div>
              )}
              {property.income3_value && property.income3_tenant && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground truncate pr-2">
                    {property.income3_tenant}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(property.income3_value)}
                  </span>
                </div>
              )}
              <div className="pt-1 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(totalIncome * property.quantity)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {property.observations && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {property.observations}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
