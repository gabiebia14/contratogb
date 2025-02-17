
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;

    // Substitui todas as variáveis encontradas no template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, String(value));
    });

    return processedContent;
  };

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      // Busca o template
      const { data: template } = await supabase
        .from('contract_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Busca o documento e seus dados extraídos
      const { data: document } = await supabase
        .from('processed_documents')
        .select('extracted_data')
        .eq('id', documentId)
        .single();

      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Processa os dados extraídos
      const variables = typeof document.extracted_data === 'string'
        ? JSON.parse(document.extracted_data)
        : document.extracted_data;

      // Processa o template substituindo as variáveis
      const processedContent = processTemplate(template.content, variables);

      // Cria o contrato com o conteúdo processado
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          document_id: documentId,
          variables: variables,
          status: 'draft',
          metadata: {
            source: 'web-interface',
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      return contract;
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateContract };
};
