
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Template, TemplateVariables } from '@/types/contracts';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export const useContractTemplates = () => {
  const [loading, setLoading] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar modelos de contrato');
        throw error;
      }

      return data as Template[];
    }
  });

  const addTemplate = async (name: string, content: string, variables: Partial<TemplateVariables>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contract_templates')
        .insert([{ 
          name, 
          content, 
          template_variables: variables 
        }]);

      if (error) throw error;

      toast.success('Modelo de contrato adicionado com sucesso');
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Erro ao adicionar modelo de contrato');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    addTemplate
  };
};
