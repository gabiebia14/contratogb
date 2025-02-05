import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtractedField } from '@/types/ocr';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

  // Try to parse the raw text if it's a JSON string
  const parseExtractedData = (data: ExtractedField[]) => {
    try {
      const rawTextField = data.find(item => item.field === 'Raw Text');
      if (rawTextField) {
        const jsonMatch = rawTextField.value.match(/```json\s*({.*})\s*```/s);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[1]);
          return Object.entries(jsonData)
            .filter(([_, value]) => value !== null && value !== '')
            .map(([key, value]) => ({
              field: key,
              value: value as string,
              confidence: 0.95 // Using default confidence since it's parsed data
            }));
        }
      }
      return data.filter(item => 
        item.field !== 'Raw Text' && 
        item.field !== 'Error' &&
        item.value !== null && 
        item.value !== '' && 
        item.value !== 'null'
      );
    } catch (error) {
      console.error('Error parsing extracted data:', error);
      return [];
    }
  };

  const validData = parseExtractedData(data);

  // Ordenar dados por tipo
  const sortedData = validData.sort((a, b) => {
    const getOrder = (field: string) => {
      if (field.startsWith('locador')) return 1;
      if (field.startsWith('locatario')) return 2;
      if (field.startsWith('fiador')) return 3;
      return 4;
    };

    const orderA = getOrder(a.field);
    const orderB = getOrder(b.field);
    return orderA - orderB;
  });

  // Função para traduzir os campos para português
  const getFieldLabel = (field: string): string => {
    const translations: { [key: string]: string } = {
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

    return translations[field] || field;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Dados Extraídos do Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {sortedData.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <span className="font-medium text-gray-700">{getFieldLabel(item.field)}:</span>
            <span className="text-gray-900">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;