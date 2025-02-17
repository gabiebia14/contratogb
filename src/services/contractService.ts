
import { supabase } from '@/integrations/supabase/client';
import { ExtractedData } from '@/types/contract';
import { processTemplateData, replaceTemplateVariables } from '@/utils/templateUtils';

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

export const generateContract = async (
  templateId: string,
  documentId: string,
  title: string,
  template: any,
  document: any
) => {
  try {
    const templateData = processTemplateData(document.extracted_data);
    const processedContent = replaceTemplateVariables(template.content, templateData);

    const { data: result, error } = await supabase.functions.invoke('generate-contract', {
      body: { 
        templateId, 
        documentId, 
        title,
        content: processedContent
      }
    });

    if (error) throw error;
    
    if (!result?.contract?.id) {
      throw new Error('Erro ao salvar contrato');
    }

    // Aguarda um momento para garantir que o contrato foi salvo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verifica se o contrato realmente existe no banco
    const { data: contract, error: verifyError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', result.contract.id)
      .maybeSingle();

    if (verifyError || !contract) {
      throw new Error('Erro ao verificar contrato gerado');
    }

    return result.contract;
  } catch (error: any) {
    console.error('Erro ao processar template:', error);
    throw new Error('Erro ao processar template: ' + (error.message || 'Erro desconhecido'));
  }
};
