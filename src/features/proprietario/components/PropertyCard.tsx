
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/properties";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const totalIncome = (property.income1_value || 0) + 
                     (property.income2_value || 0) + 
                     (property.income3_value || 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          {property.quantity > 1 && ` (${property.quantity})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p><strong>Endereço:</strong> {property.address}</p>
            <p><strong>Cidade:</strong> {property.city}</p>
          </div>

          {totalIncome > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">Rendas:</p>
              {property.income1_value && property.income1_tenant && (
                <div className="pl-4 border-l-2 border-primary">
                  <p><strong>Inquilino:</strong> {property.income1_tenant}</p>
                  <p><strong>Valor:</strong> {formatCurrency(property.income1_value)}</p>
                </div>
              )}
              {property.income2_value && property.income2_tenant && (
                <div className="pl-4 border-l-2 border-primary">
                  <p><strong>Inquilino:</strong> {property.income2_tenant}</p>
                  <p><strong>Valor:</strong> {formatCurrency(property.income2_value)}</p>
                </div>
              )}
              {property.income3_value && property.income3_tenant && (
                <div className="pl-4 border-l-2 border-primary">
                  <p><strong>Inquilino:</strong> {property.income3_tenant}</p>
                  <p><strong>Valor:</strong> {formatCurrency(property.income3_value)}</p>
                </div>
              )}
              {(property.income1_value || property.income2_value || property.income3_value) && (
                <div className="mt-2 pt-2 border-t">
                  <p className="font-semibold">
                    Total: {formatCurrency(totalIncome)}
                  </p>
                </div>
              )}
            </div>
          )}

          {property.observations && (
            <p><strong>Observações:</strong> {property.observations}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
