
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtractedField } from '@/types/ocr';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

const fieldTranslations: Record<string, string> = {
  locador_nome: 'Nome do Locador',
  locador_nacionalidade: 'Nacionalidade do Locador',
  locador_estado_civil: 'Estado Civil do Locador',
  locador_profissao: 'Profissão do Locador',
  locador_rg: 'RG do Locador',
  locador_cpf: 'CPF do Locador',
  locador_endereco: 'Endereço do Locador',
  locador_bairro: 'Bairro do Locador',
  locador_cep: 'CEP do Locador',
  locador_cidade: 'Cidade do Locador',
  locador_estado: 'Estado do Locador',
  locataria_nome: 'Nome do Locatário',
  locataria_nacionalidade: 'Nacionalidade do Locatário',
  locataria_estado_civil: 'Estado Civil do Locatário',
  locataria_profissao: 'Profissão do Locatário',
  locataria_rg: 'RG do Locatário',
  locataria_cpf: 'CPF do Locatário',
  locataria_endereco: 'Endereço do Locatário',
  locataria_bairro: 'Bairro do Locatário',
  locataria_cep: 'CEP do Locatário',
  locataria_cidade: 'Cidade do Locatário',
  locataria_estado: 'Estado do Locatário',
  locataria_telefone: 'Telefone do Locatário',
  locatario_nome: 'Nome do Locatário',
  locatario_nacionalidade: 'Nacionalidade do Locatário',
  locatario_estado_civil: 'Estado Civil do Locatário',
  locatario_profissao: 'Profissão do Locatário',
  locatario_rg: 'RG do Locatário',
  locatario_cpf: 'CPF do Locatário',
  locatario_endereco: 'Endereço do Locatário',
  locatario_bairro: 'Bairro do Locatário',
  locatario_cep: 'CEP do Locatário',
  locatario_cidade: 'Cidade do Locatário',
  locatario_estado: 'Estado do Locatário',
  locatario_telefone: 'Telefone do Locatário',
  fiador_nome: 'Nome do Fiador',
  fiador_nacionalidade: 'Nacionalidade do Fiador',
  fiador_estado_civil: 'Estado Civil do Fiador',
  fiador_profissao: 'Profissão do Fiador',
  fiador_rg: 'RG do Fiador',
  fiador_cpf: 'CPF do Fiador',
  fiador_endereco: 'Endereço do Fiador',
  fiador_bairro: 'Bairro do Fiador',
  fiador_cep: 'CEP do Fiador',
  fiador_cidade: 'Cidade do Fiador',
  fiador_estado: 'Estado do Fiador',
  fiador_telefone: 'Telefone do Fiador'
};

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

  const getValidFields = () => {
    // Find the field containing our data
    const extractedField = data.find(item => item.value && typeof item.value === 'string');
    if (!extractedField) return [];
    
    // Try to parse the data as an object
    try {
      const jsonData = JSON.parse(extractedField.value);
      return Object.entries(jsonData)
        .filter(([_, value]) => value !== null && value !== '')
        .map(([key, value]) => ({
          field: key,
          value: value as string
        }));
    } catch (error) {
      console.error('Error parsing data:', error);
      return [];
    }
  };

  const sortFields = (fields: { field: string; value: string }[]) => {
    return fields.sort((a, b) => {
      const getOrder = (field: string) => {
        if (field.startsWith('locador')) return 1;
        if (field.startsWith('locatario') || field.startsWith('locataria')) return 2;
        if (field.startsWith('fiador')) return 3;
        return 4;
      };

      return getOrder(a.field) - getOrder(b.field);
    });
  };

  const validFields = sortFields(getValidFields());

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Dados Extraídos do Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {validFields.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <span className="font-medium text-gray-700">
              {fieldTranslations[item.field] || item.field}:
            </span>
            <span className="text-gray-900">{item.value}</span>
          </div>
        ))}
        {validFields.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            Nenhum dado extraído do documento
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;
