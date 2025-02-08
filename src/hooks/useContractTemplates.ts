import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useContractGemini = () => {
  const processContract = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-contract', {
        body: { content }
      });

      if (error) throw error;

      return data.data;
    } catch (error) {
      console.error('Error processing contract with Gemini:', error);
      toast.error('Erro ao processar contrato com Gemini');
      return content; // Return original content as fallback
    }
  };

  return { processContract };
};
