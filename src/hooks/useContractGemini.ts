
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

export const useContractGemini = () => {
  const processContract = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-contract', {
        body: { content }
      });

      if (error) throw error;

      if (data && typeof data.text === 'string') {
        // Remove code blocks if present
        const cleanText = data.text.replace(/```(?:.*\n)?([\s\S]*?)```/g, '$1').trim();
        return cleanText;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (error) {
      console.error("Error processing contract with Gemini:", error);
      throw error;
    }
  };

  return { processContract };
};
