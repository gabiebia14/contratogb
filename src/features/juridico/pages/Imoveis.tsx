
import { Building2, Upload } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FileUploadArea from '@/components/ocr/FileUploadArea';

export default function JuridicoImoveis() {
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

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = 
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'todas' || property.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (files: File[]) => {
    if (!selectedProperty || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedProperty.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property_contracts')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Erro ao fazer upload do contrato');
        throw uploadError;
      }

      toast.success('Contrato anexado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do contrato');
    }
  };

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
          {filteredProperties?.map((property) => (
            <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <h3 className="font-semibold capitalize">{property.type}</h3>
                <p className="text-sm text-gray-600">{property.address}</p>
                <p className="text-sm text-gray-500">{property.city}</p>
                {property.observations && (
                  <p className="text-sm text-gray-500 mt-2">{property.observations}</p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Anexar Contrato
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Anexar Contrato</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Imóvel:</h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="text-sm text-gray-500">{property.city}</p>
                        
                        <div className="mt-6">
                          <FileUploadArea onFilesSelected={handleFileUpload} />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  
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
