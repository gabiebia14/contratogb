import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExtractedField } from '@/types/ocr';

interface ExtractedDataDisplayProps {
  data: ExtractedField[];
}

const ExtractedDataDisplay = ({ data }: ExtractedDataDisplayProps) => {
  if (!data.length) return null;

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

  // Filtrar apenas os campos com valores não nulos
  const validData = data.filter(item => 
    item.value !== null && 
    item.value !== undefined && 
    item.value !== '' && 
    item.value !== 'null'
  );

  // Ordenar dados por tipo (locador, locatário, fiador) e confiança
  const sortedData = validData.sort((a, b) => {
    const getOrder = (field: string) => {
      if (field.startsWith('locador')) return 1;
      if (field.startsWith('locatario')) return 2;
      if (field.startsWith('fiador')) return 3;
      return 4;
    };

    const orderA = getOrder(a.field);
    const orderB = getOrder(b.field);

    if (orderA !== orderB) return orderA - orderB;
    return b.confidence - a.confidence;
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-100 text-green-800';
    if (confidence > 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Dados Extraídos do Documento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Campo</TableHead>
              <TableHead className="w-1/2">Valor</TableHead>
              <TableHead className="w-32 text-right">Confiança</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-700">
                  {getFieldLabel(item.field)}
                </TableCell>
                <TableCell className="text-gray-900">{item.value}</TableCell>
                <TableCell className="text-right">
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}
                  >
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataDisplay;