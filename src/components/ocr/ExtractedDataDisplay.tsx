
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtractedField } from '@/types/ocr';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

export const fieldTranslations: Record<string, string> = {
  nome_completo: 'Nome Completo',
  rg: 'RG',
  cpf: 'CPF',
  data_nascimento: 'Data de Nascimento',
  endereco: 'Endereço',
  bairro: 'Bairro',
  cep: 'CEP',
  cidade: 'Cidade',
  estado: 'Estado',
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
  locataria_nome: 'Nome da Locatária',
  locataria_nacionalidade: 'Nacionalidade da Locatária',
  locataria_estado_civil: 'Estado Civil da Locatária',
  locataria_profissao: 'Profissão da Locatária',
  locataria_rg: 'RG da Locatária',
  locataria_cpf: 'CPF da Locatária',
  locataria_endereco: 'Endereço da Locatária',
  locataria_bairro: 'Bairro da Locatária',
  locataria_cep: 'CEP da Locatária',
  locataria_cidade: 'Cidade da Locatária',
  locataria_estado: 'Estado da Locatária',
  locataria_telefone: 'Telefone da Locatária',
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
  fiadora_nome: 'Nome da Fiadora',
  fiadora_nacionalidade: 'Nacionalidade da Fiadora',
  fiadora_estado_civil: 'Estado Civil da Fiadora',
  fiadora_profissao: 'Profissão da Fiadora',
  fiadora_rg: 'RG da Fiadora',
  fiadora_cpf: 'CPF da Fiadora',
  fiadora_endereco: 'Endereço da Fiadora',
  fiadora_bairro: 'Bairro da Fiadora',
  fiadora_cep: 'CEP da Fiadora',
  fiadora_cidade: 'Cidade da Fiadora',
  fiadora_estado: 'Estado da Fiadora',
  fiadora_telefone: 'Telefone da Fiadora',
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
  if (!data?.length) {
    console.log('No data provided to ExtractedDataDisplay');
    return null;
  }

  const getValidFields = () => {
    const extractedField = data[0];
    if (!extractedField?.value) {
      console.log('No value found in extracted field:', extractedField);
      return [];
    }
    
    try {
      let parsedData = extractedField.value;
      if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }

      console.log('Parsed data:', parsedData);

      if (!parsedData || typeof parsedData !== 'object') {
        console.error('Invalid data format:', parsedData);
        return [];
      }

      // Remove campos duplicados baseados no tipo de locatário/locatária
      const fields = Object.entries(parsedData)
        .filter(([key, value]) => value != null && value !== '')
        .reduce((acc, [key, value]) => {
          // Se já existe um campo equivalente para locatário/locatária, não adicione
          const baseField = key.replace(/(locatario|locataria)_/, '');
          const existingKey = acc.find(item => 
            item.field.endsWith(`_${baseField}`) && 
            item.field !== key
          );

          if (!existingKey) {
            acc.push({
              field: key,
              value: typeof value === 'string' ? value : JSON.stringify(value)
            });
          }
          return acc;
        }, [] as { field: string; value: string }[]);

      console.log('Processed fields:', fields);
      return fields;
    } catch (error) {
      console.error('Error processing data:', error);
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
  console.log('Final valid fields:', validFields);

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
