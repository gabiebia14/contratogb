
import { supabase } from '@/integrations/supabase/client';
import { ExtractedData } from '@/types/contract';
import { processTemplate } from '@/utils/templateUtils';

export const fetchTemplate = async (templateId: string) => {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', templateId.trim())
    .single();

  if (error) {
    console.error('Erro ao buscar template:', error);
    throw new Error('Erro ao buscar template');
  }

  if (!data?.content) {
    throw new Error('Template não possui conteúdo');
  }

  return data;
};

export const fetchDocument = async (documentId: string) => {
  const { data, error } = await supabase
    .from('processed_documents')
    .select('*')
    .eq('id', documentId.trim())
    .single();

  if (error) {
    console.error('Erro ao buscar documento:', error);
    throw new Error('Erro ao buscar documento');
  }

  if (!data?.extracted_data) {
    throw new Error('Documento não possui dados extraídos');
  }

  return data;
};

const mergeDocumentData = async (documents: Array<{ role: string; documentId: string }>) => {
  let mergedData: Record<string, any> = {};

  for (const doc of documents) {
    const document = await fetchDocument(doc.documentId);
    const extractedData = typeof document.extracted_data === 'string'
      ? JSON.parse(document.extracted_data)
      : document.extracted_data;

    // Determina o prefixo com base no papel
    const prefix = doc.role.toLowerCase();

    // Mapeia os campos com o prefixo correto
    Object.entries(extractedData).forEach(([key, value]) => {
      // Se o campo já tem o prefixo correto, usa direto
      if (key.startsWith(prefix)) {
        mergedData[key] = value;
      } else {
        // Se não tem prefixo, adiciona o prefixo correto
        const newKey = `${prefix}_${key}`;
        mergedData[newKey] = value;
      }
    });
  }

  return mergedData;
};

export const generateContract = async (
  templateId: string,
  documents: Array<{ role: string; documentId: string }>,
  title: string
) => {
  try {
    console.log('Iniciando geração do contrato...', { templateId, documents, title });
    
    // Busca o template
    const template = await fetchTemplate(templateId);
    
    // Processa todos os documentos e mescla seus dados
    const mergedData = await mergeDocumentData(documents);
    console.log('Dados mesclados dos documentos:', mergedData);
    
    // Processa o template com os dados mesclados
    const processedContent = processTemplate(template.content, mergedData);
    console.log('Conteúdo processado:', processedContent);

    // Chama a edge function para gerar o contrato
    const { data: result, error } = await supabase.functions.invoke('generate-contract', {
      body: { 
        templateId, 
        documentId: documents[0].documentId, // Mantém o primeiro documento como principal
        title,
        content: processedContent,
        metadata: {
          parties: documents
        }
      }
    });

    if (error) {
      console.error('Erro na edge function:', error);
      throw error;
    }
    
    if (!result?.contract?.id) {
      console.error('Edge function não retornou ID do contrato');
      throw new Error('Erro ao salvar contrato: ID não retornado');
    }

    console.log('Contrato gerado com sucesso:', result.contract.id);
    return result.contract;
  } catch (error: any) {
    console.error('Erro ao processar template:', error);
    throw new Error('Erro ao processar template: ' + (error.message || 'Erro desconhecido'));
  }
};
