
import { DocumentFields } from '@/types/contract-generation';

const DOCUMENT_FIELDS = [
  'nome', 'nome_completo', 'cpf', 'rg', 'nacionalidade', 
  'estado_civil', 'profissao', 'endereco', 'bairro', 
  'cidade', 'estado', 'cep', 'email', 'telefone'
];

export const mapDocumentFields = (rawData: any, prefix: string): Record<string, string> => {
  const mappedData: Record<string, string> = {};

  DOCUMENT_FIELDS.forEach(field => {
    const possibleKeys = [
      `${prefix}${field}`,
      field,
      `${prefix}${field.toLowerCase()}`,
      field.toLowerCase(),
    ];

    for (const key of possibleKeys) {
      if (rawData[key] !== undefined && rawData[key] !== null) {
        mappedData[`${prefix}${field}`] = String(rawData[key]);
        
        if (!mappedData[field]) {
          mappedData[field] = String(rawData[key]);
        }
        break;
      }
    }
  });

  return mappedData;
};

export const getPartyPrefix = (role: string): string => {
  if (role.startsWith('locador')) {
    return role.endsWith('a') ? 'locadora_' : 'locador_';
  } else if (role.startsWith('locatari')) {
    return role.endsWith('a') ? 'locataria_' : 'locatario_';
  } else if (role.startsWith('fiador')) {
    return role.endsWith('a') ? 'fiadora_' : 'fiador_';
  }
  return '';
};
