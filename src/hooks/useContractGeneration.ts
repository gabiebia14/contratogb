
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      const { data: template } = await supabase
        .from('contract_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template não encontrado');
      }

      const { data: document } = await supabase
        .from('processed_documents')
        .select('extracted_data')
        .eq('id', documentId)
        .single();

      if (!document) {
        throw new Error('Documento não encontrado');
      }

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: template.content,
          template_id: templateId,
          document_id: documentId,
          variables: document.extracted_data,
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
