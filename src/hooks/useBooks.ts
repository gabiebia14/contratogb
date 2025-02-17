
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  file_path: string;
  cover_image: string;
  last_page: number;
  total_pages: number;
  created_at: string;
}

export function useBooks() {
  const navigate = useNavigate();

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Não autenticado');
      }

      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error('Erro ao carregar livros:', error);
        if (error.message === 'Não autenticado') {
          navigate('/auth');
        } else {
          toast.error('Erro ao carregar os livros');
        }
      }
    }
  });

  return { books, isLoading };
}
