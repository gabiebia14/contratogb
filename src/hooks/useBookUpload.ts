
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBookUpload(onSuccess: () => void) {
  const [uploadingBook, setUploadingBook] = useState(false);
  const navigate = useNavigate();

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

      const formData = new FormData();
      formData.append('file', file);

      const { error: functionError, data: functionData } = await supabase.functions.invoke('extract-pdf-cover', {
        body: formData,
      });

      if (functionError) throw functionError;

      let coverImagePath = '/placeholder.svg';
      if (functionData?.coverImageUrl) {
        coverImagePath = functionData.coverImageUrl;
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
