
import { ExtractedData } from '@/types/contract';

export const processTemplateData = (rawData: any): ExtractedData => {
  const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  return parsedData;
};

export const replaceTemplateVariables = (content: string, data: Record<string, any>): string => {
  let processedContent = content;
  
  // Primeiro, substitui variáveis com prefixo
  Object.entries(data).forEach(([key, value]) => {
    const variablePattern = new RegExp(`{${key}}`, 'g');
    processedContent = processedContent.replace(variablePattern, value || '');
  });

  // Depois, tenta substituir variáveis sem prefixo usando dados do primeiro documento
  const basicFields = [
    'nome', 'nacionalidade', 'estado_civil', 'profissao', 'rg', 'cpf',
    'endereco', 'bairro', 'cidade', 'estado', 'cep'
  ];

  basicFields.forEach(field => {
    const pattern = new RegExp(`{${field}}`, 'g');
    const value = data[field] || 
                 data[`locador_${field}`] || 
                 data[`locatario_${field}`] || 
                 data[`locataria_${field}`] || 
                 '';
    processedContent = processedContent.replace(pattern, value);
  });

  return processedContent;
};
