
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/properties";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const totalIncome = property.incomes.reduce((sum, income) => sum + income.value, 0);

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

          {property.incomes.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">Rendas:</p>
              {property.incomes.map((income, index) => (
                <div key={index} className="pl-4 border-l-2 border-primary">
                  <p>
                    <strong>Inquilino:</strong> {income.tenant}
                  </p>
                  <p>
                    <strong>Valor:</strong> R$ {income.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
              {property.incomes.length > 1 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="font-semibold">
                    Total: R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
