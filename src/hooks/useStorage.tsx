
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, path: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error('Você precisa estar autenticado para fazer upload de arquivos.');
      throw new Error('Not authenticated');
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('ocr_documents')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ocr_documents')
        .getPublicUrl(filePath);

      toast.success('Arquivo enviado com sucesso!');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo.');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error('Você precisa estar autenticado para excluir arquivos.');
      throw new Error('Not authenticated');
    }

    try {
      const { error } = await supabase.storage
        .from('ocr_documents')
        .remove([path]);

      if (error) {
        throw error;
      }

      toast.success('Arquivo excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Erro ao excluir arquivo.');
      throw error;
    }
  };

  return {
    uploading,
    uploadFile,
    deleteFile
  };
};
