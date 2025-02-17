
import { ExtractedData } from '@/types/contract';

export const processTemplateData = (rawData: any): ExtractedData => {
  const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

  return {
    locatario_nome: parsedData.locatario_nome || '',
    locatario_nacionalidade: parsedData.locatario_nacionalidade || '',
    locatario_estado_civil: parsedData.locatario_estado_civil || '',
    locatario_profissao: parsedData.locatario_profissao || '',
    locatario_rg: parsedData.locatario_rg || '',
    locatario_cpf: parsedData.locatario_cpf || '',
    locatario_endereco: parsedData.locatario_endereco || '',
    locatario_cidade: parsedData.locatario_cidade || '',
    locatario_estado: parsedData.locatario_estado || '',

    locataria_nome: parsedData.locataria_nome || '',
    locataria_nacionalidade: parsedData.locataria_nacionalidade || '',
    locataria_estado_civil: parsedData.locataria_estado_civil || '',
    locataria_profissao: parsedData.locataria_profissao || '',
    locataria_rg: parsedData.locataria_rg || '',
    locataria_cpf: parsedData.locataria_cpf || '',
    locataria_endereco: parsedData.locataria_endereco || '',
    locataria_cidade: parsedData.locataria_cidade || '',
    locataria_estado: parsedData.locataria_estado || '',

    locador_nome: parsedData.locador_nome || '',
    locador_nacionalidade: parsedData.locador_nacionalidade || '',
    locador_estado_civil: parsedData.locador_estado_civil || '',
    locador_profissao: parsedData.locador_profissao || '',
    locador_rg: parsedData.locador_rg || '',
    locador_cpf: parsedData.locador_cpf || '',
    locador_endereco: parsedData.locador_endereco || '',
    locador_cidade: parsedData.locador_cidade || '',
    locador_estado: parsedData.locador_estado || '',

    locadora_nome: parsedData.locadora_nome || '',
    locadora_nacionalidade: parsedData.locadora_nacionalidade || '',
    locadora_estado_civil: parsedData.locadora_estado_civil || '',
    locadora_profissao: parsedData.locadora_profissao || '',
    locadora_rg: parsedData.locadora_rg || '',
    locadora_cpf: parsedData.locadora_cpf || '',
    locadora_endereco: parsedData.locadora_endereco || '',
    locadora_cidade: parsedData.locadora_cidade || '',
    locadora_estado: parsedData.locadora_estado || ''
  };
};

export const replaceTemplateVariables = (content: string, data: ExtractedData): string => {
  let processedContent = content;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value || '');
  });
  return processedContent;
};
