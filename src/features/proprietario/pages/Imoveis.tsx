
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";
import { Property, PropertyType } from "@/types/properties";
import { Upload } from "lucide-react";
import { read, utils } from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Imoveis() {
  const { properties, isLoading } = useProperties();
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setImporting(true);
      
      // Lê o arquivo
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Mapeia os dados para o formato correto
      const properties = jsonData.map((row: any) => ({
        type: normalizePropertyType(row['TIPO DE IMÓVEL']),
        quantity: parseInt(row['QUANTIDADE']) || 1,
        address: row['ENDEREÇO'],
        income: row['RENDA'] ? parseFloat(row['RENDA']) : null,
        tenant: row['LOCATÁRIO(A)'] || null,
        observations: row['OBSERVAÇÕES'] || null,
        city: row['CIDADE']
      }));

      // Insere os dados no Supabase
      const { error } = await supabase
        .from('properties')
        .insert(properties);

      if (error) throw error;

      toast.success('Dados importados com sucesso!');
      
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados. Verifique o formato da planilha.');
    } finally {
      setImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  const normalizePropertyType = (type: string): PropertyType => {
    type = type.toLowerCase().trim();
    
    const typeMap: Record<string, PropertyType> = {
      'casa': 'casa',
      'apartamento': 'apartamento',
      'comercial': 'comercial',
      'rural': 'rural',
      'terreno': 'terreno',
      'área': 'terreno',
      'area': 'terreno'
    };

    return typeMap[type] || 'casa';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Imóveis</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            disabled={importing}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Importar Planilha'}
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={importing}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Carregando imóveis...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties?.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Endereço:</strong> {property.address}</p>
                  <p><strong>Cidade:</strong> {property.city}</p>
                  {property.tenant && (
                    <p><strong>Locatário:</strong> {property.tenant}</p>
                  )}
                  {property.income && (
                    <p><strong>Renda:</strong> R$ {property.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                  {property.observations && (
                    <p><strong>Observações:</strong> {property.observations}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
