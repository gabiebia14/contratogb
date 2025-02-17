
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
    console.log('Iniciando geração do contrato...');
    const templateData = processTemplateData(document.extracted_data);
    const processedContent = replaceTemplateVariables(template.content, templateData);

    console.log('Chamando edge function generate-contract...');
    const { data: result, error } = await supabase.functions.invoke('generate-contract', {
      body: { 
        templateId, 
        documentId, 
        title,
        content: processedContent
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

    // Aumenta o tempo de espera para garantir que o contrato foi salvo
    console.log('Aguardando persistência do contrato...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tenta buscar o contrato algumas vezes antes de desistir
    let attempts = 0;
    let contract = null;
    while (attempts < 3 && !contract) {
      console.log(`Tentativa ${attempts + 1} de verificar contrato...`);
      const { data, error: verifyError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', result.contract.id)
        .maybeSingle();

      if (!verifyError && data) {
        contract = data;
        break;
      }

      attempts++;
      if (attempts < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!contract) {
      console.error('Contrato não encontrado após tentativas');
      throw new Error('Erro ao verificar contrato gerado: contrato não encontrado');
    }

    console.log('Contrato gerado com sucesso:', contract.id);
    return result.contract;
  } catch (error: any) {
    console.error('Erro ao processar template:', error);
    throw new Error('Erro ao processar template: ' + (error.message || 'Erro desconhecido'));
  }
};
