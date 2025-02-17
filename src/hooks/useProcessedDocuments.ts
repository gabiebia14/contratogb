
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessedDocument {
  id: string;
  file_name: string;
  document_type: 'documentos_pessoais' | 'comprovante_endereco';
  document_role?: 'locador' | 'locadora' | 'locatario' | 'locataria' | 'fiador' | 'fiadora';
  extracted_data: Record<string, any>;
  created_at: string;
}

export const useProcessedDocuments = () => {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['processed-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar documentos:', error);
        toast.error('Erro ao carregar documentos processados');
        throw error;
      }

      return data as ProcessedDocument[];
    },
  });

  return { documents, isLoading };
};
