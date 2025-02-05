import { useState } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';

export const useFirestore = (collectionName: string) => {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);

  const add = async (data: any) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date()
      });
      toast.success('Documento criado com sucesso!');
      return docRef.id;
    } catch (error) {
      toast.error('Erro ao criar documento.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: any) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      toast.success('Documento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar documento.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success('Documento excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir documento.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async (conditions?: { field: string; operator: string; value: any }[]) => {
    setLoading(true);
    try {
      let q = collection(db, collectionName);
      
      if (conditions) {
        q = query(q, ...conditions.map(c => where(c.field, c.operator as any, c.value)));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      toast.error('Erro ao buscar documentos.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    add,
    update,
    remove,
    getDocuments
  };
};