
import { useState, useEffect } from 'react';
import { Template } from '@/types/contracts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useContractTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

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

  return { templates, loading };
};
