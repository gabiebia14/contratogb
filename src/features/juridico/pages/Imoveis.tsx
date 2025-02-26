
import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyType } from '@/types/properties';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

export default function JuridicoImoveis() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | 'todas'>('todas');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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

  const { data: contracts } = useQuery({
    queryKey: ['property-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar contratos');
        throw error;
      }

      return data;
    }
  });

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'todas' || property.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const categories = [
    { type: 'todas', label: 'Todas', count: properties?.length || 0 },
    { type: 'casa', label: 'Casas', count: properties?.filter(p => p.type === 'casa').length || 0 },
    { type: 'apartamento', label: 'Apartamentos', count: properties?.filter(p => p.type === 'apartamento').length || 0 },
    { type: 'comercial', label: 'Comercial', count: properties?.filter(p => p.type === 'comercial').length || 0 },
    { type: 'area', label: 'Áreas', count: properties?.filter(p => p.type === 'area').length || 0 },
    { type: 'lote', label: 'Lotes', count: properties?.filter(p => p.type === 'lote').length || 0 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Imóveis
        </h1>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.type}
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${
              selectedType === category.type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedType(category.type as PropertyType | 'todas')}
          >
            <div className="text-center">
              <h3 className="font-semibold">{category.label}</h3>
              <p className="text-2xl font-bold text-primary">{category.count}</p>
            </div>
          </Card>
        ))}
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
          {filteredProperties?.map((property) => {
            const propertyContracts = contracts?.filter(c => c.property_id === property.id) || [];
            const activeContract = propertyContracts.find(c => c.status === 'active');
            
            return (
              <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <h3 className="font-semibold capitalize">{property.type}</h3>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-sm text-gray-500">{property.city}</p>
                  {property.observations && (
                    <p className="text-sm text-gray-500 mt-2">{property.observations}</p>
                  )}
                  
                  {activeContract && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Contrato Ativo</p>
                      <p className="text-sm text-green-600">
                        Locatário: {activeContract.tenant_name}
                      </p>
                      {activeContract.lease_start && (
                        <p className="text-sm text-green-600">
                          Período: {new Date(activeContract.lease_start).toLocaleDateString()} até{' '}
                          {activeContract.lease_end ? new Date(activeContract.lease_end).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Histórico de Contratos ({propertyContracts.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Histórico de Contratos - {property.address}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {propertyContracts.length === 0 ? (
                            <p className="text-gray-500">Nenhum contrato registrado.</p>
                          ) : (
                            <div className="space-y-4">
                              {propertyContracts.map((contract) => (
                                <div
                                  key={contract.id}
                                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{contract.title}</h4>
                                      <p className="text-sm text-gray-600">
                                        Locatário: {contract.tenant_name}
                                      </p>
                                      {contract.lease_start && (
                                        <p className="text-sm text-gray-500">
                                          Período: {new Date(contract.lease_start).toLocaleDateString()} até{' '}
                                          {contract.lease_end ? new Date(contract.lease_end).toLocaleDateString() : 'N/A'}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      variant="link"
                                      onClick={() => navigate(`/juridico/contracts/${contract.id}`)}
                                    >
                                      Ver Contrato
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" onClick={() => navigate('/juridico/contracts')}>
                      Adicionar Contrato
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
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
