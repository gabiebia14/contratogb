
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useContractGemini } from '@/hooks/useContractGemini';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);
  const { processContract } = useContractGemini();

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      // Primeiro, buscar o template e o documento
      const [templateResult, documentResult] = await Promise.all([
        supabase
          .from('contract_templates')
          .select('*')
          .eq('id', templateId)
          .single(),
        supabase
          .from('processed_documents')
          .select('*')
          .eq('id', documentId)
          .single()
      ]);

      if (templateResult.error) throw new Error('Erro ao buscar template');
      if (documentResult.error) throw new Error('Erro ao buscar documento');

      const template = templateResult.data;
      const document = documentResult.data;

      // Processar o conteúdo do template com o Gemini para substituir as variáveis
      const processedContent = await processContract(template.content);

      // Criar o contrato no banco de dados
      const { data: contract, error } = await supabase.functions.invoke('generate-contract', {
        body: { 
          templateId, 
          documentId, 
          title,
          processedContent,
          documentData: document.extracted_data 
        }
      });

      if (error) throw error;

      if (!contract?.contract) {
        throw new Error('Erro ao gerar contrato');
      }

      toast.success('Contrato gerado com sucesso!');
      return contract.contract;
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContract
  };
};
