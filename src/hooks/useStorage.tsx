import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

export const useStorage = () => {
  const { storage } = useFirebase();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, path: string) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      toast.success('Arquivo enviado com sucesso!');
      return url;
    } catch (error) {
      toast.error('Erro ao enviar arquivo.');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      toast.success('Arquivo excluído com sucesso!');
    } catch (error) {
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