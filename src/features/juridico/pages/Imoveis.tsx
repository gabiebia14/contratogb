
import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/properties';
import { toast } from 'sonner';

export default function JuridicoImoveis() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar imóveis');
        throw error;
      }

      return data as Property[];
    }
  });

  const filteredProperties = properties?.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Imóveis
        </h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Pesquisar por endereço ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties?.map((property) => (
            <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <h3 className="font-semibold capitalize">{property.type}</h3>
                <p className="text-sm text-gray-600">{property.address}</p>
                <p className="text-sm text-gray-500">{property.city}</p>
                {property.observations && (
                  <p className="text-sm text-gray-500 mt-2">{property.observations}</p>
                )}
                <div className="flex justify-end mt-4">
                  <Button variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredProperties?.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Nenhum imóvel encontrado</h3>
          <p className="text-gray-500">Tente usar outros termos na pesquisa</p>
        </div>
      )}
    </div>
  );
}
