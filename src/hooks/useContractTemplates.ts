
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  template_variables?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const useContractTemplates = () => {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar templates:', error);
        toast.error('Erro ao carregar os templates');
        throw error;
      }

      return data as Template[];
    },
  });

  return { templates, isLoading };
};
