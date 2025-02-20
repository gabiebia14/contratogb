
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function useBookUpload(onSuccess: () => void) {
  const [uploadingBook, setUploadingBook] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    try {
      setUploadingBook(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente');
        navigate('/auth');
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('library_pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Tenta extrair a capa, mas não falha se houver erro
      let coverImagePath = '/placeholder.svg';
      try {
        const formData = new FormData();
        formData.append('file', file);

        const { error: functionError, data: functionData } = await supabase.functions.invoke('extract-pdf-cover', {
          body: formData,
        });

        if (!functionError && functionData?.coverImageUrl) {
          coverImagePath = functionData.coverImageUrl;
        } else {
          console.warn('Não foi possível extrair a capa do PDF, usando placeholder:', functionError);
        }
      } catch (coverError) {
        console.warn('Erro ao extrair capa do PDF:', coverError);
      }

      const { error: insertError } = await supabase
        .from('library_books')
        .insert({
          title: file.name.replace(`.${fileExt}`, ''),
          file_path: filePath,
          file_size: file.size,
          user_id: session.user.id,
          cover_image: coverImagePath
        });

      if (insertError) throw insertError;

      // Atualiza a cache do React Query
      await queryClient.invalidateQueries({ queryKey: ['library-books'] });

      toast.success('Livro adicionado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do livro');
    } finally {
      setUploadingBook(false);
    }
  };

  return {
    uploadingBook,
    handleFileUpload
  };
}
