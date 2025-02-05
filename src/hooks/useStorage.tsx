
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, path: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('ocr_documents')
        .upload(filePath, file);

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
