
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

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

  const { mutateAsync: addTemplate, isPending } = useMutation({
    mutationFn: async (templateData: { name: string; content: string; variables: Record<string, string> }) => {
      const { data, error } = await supabase
        .from('contract_templates')
        .insert({
          name: templateData.name,
          content: templateData.content,
          template_variables: templateData.variables,
          category: 'Geral'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar template:', error);
        toast.error('Erro ao adicionar template');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
  });

  return {
    templates,
    isLoading,
    addTemplate,
    loading: isLoading || isPending
  };
};
