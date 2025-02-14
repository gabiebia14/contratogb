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
  data_processamento: 'Data de Processamento',
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
  locatario_telefone: 'Telefone do Locatário'
};

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data?.length) {
    console.log('Nenhum dado fornecido para ExtractedDataDisplay');
    return null;
  }

  const getValidFields = () => {
    const extractedField = data[0];
    if (!extractedField?.value) {
      console.log('Nenhum valor encontrado no campo extraído:', extractedField);
      return [];
    }
    
    try {
      let parsedData = extractedField.value;
      if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }

      console.log('Dados parseados:', parsedData);

      if (!parsedData || typeof parsedData !== 'object') {
        console.error('Formato de dados inválido:', parsedData);
        return [];
      }

      // Mantém todos os campos, sem filtrar
      const fields = Object.entries(parsedData)
        .filter(([_, value]) => value != null && value !== '')
        .map(([key, value]) => ({
          field: key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        }));

      // Formata a data de processamento se existir
      const processedFields = fields.map(field => {
        if (field.field === 'data_processamento') {
          try {
            const date = new Date(field.value);
            field.value = date.toLocaleString('pt-BR');
          } catch (e) {
            console.error('Erro ao formatar data:', e);
          }
        }
        return field;
      });

      console.log('Campos processados:', processedFields);
      return processedFields;
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      return [];
    }
  };

  const validFields = getValidFields();

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
