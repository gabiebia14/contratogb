
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: { templateId, documentId, title }
      });

      if (error) throw error;

      if (!data?.contract) {
        throw new Error('Erro ao gerar contrato');
      }

      toast.success('Contrato gerado com sucesso!');
      return data.contract;
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
