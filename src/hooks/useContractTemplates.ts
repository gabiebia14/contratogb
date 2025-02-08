import { useState, useEffect } from 'react';
import { Template } from '@/types/contracts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useContractGemini } from './useContractGemini';

export const useContractTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { processContract } = useContractGemini();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const formattedTemplates = data.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category || 'Geral',
        lastModified: new Date(template.updated_at || template.created_at).toLocaleDateString(),
        downloads: 0,
        content: template.content,
        template_variables: template.template_variables as Record<string, string>
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar modelos de contrato');
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (name: string, content: string, category?: string) => {
    try {
      setLoading(true);

      // Processar o conteúdo do contrato com o Gemini
      const processedContent = await processContract(content);

      const { data: template, error } = await supabase
        .from('contract_templates')
        .insert({
          name,
          content: processedContent,
          category: category || 'Geral',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const formattedTemplate: Template = {
        id: template.id,
        name: template.name,
        category: template.category || 'Geral',
        lastModified: new Date(template.created_at).toLocaleDateString(),
        downloads: 0,
        content: template.content,
        template_variables: template.template_variables as Record<string, string>
      };

      setTemplates(prev => [...prev, formattedTemplate]);
      toast.success('Modelo de contrato adicionado com sucesso');
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Erro ao adicionar modelo de contrato');
    } finally {
      setLoading(false);
    }
  };

  return { templates, loading, addTemplate };
};
