
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/types/properties";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          {property.quantity > 1 && ` (${property.quantity})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Endereço:</strong> {property.address}</p>
          <p><strong>Cidade:</strong> {property.city}</p>
          {property.tenant && (
            <p><strong>Locatário:</strong> {property.tenant}</p>
          )}
          {property.income !== null && (
            <p><strong>Renda:</strong> R$ {property.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          )}
          {property.observations && (
            <p><strong>Observações:</strong> {property.observations}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
