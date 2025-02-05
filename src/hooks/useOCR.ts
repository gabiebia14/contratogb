import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedField } from '@/types/ocr';
import { useStorage } from './useStorage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';

interface ProcessedDocument {
  id: string;
  name: string;
  processedAt: Date;
  extractedData: ExtractedField[];
}

export const useOCR = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const { uploadFile } = useStorage();
  const { db } = useFirebase();

  const loadProcessedDocuments = async () => {
    try {
      const processedDocsRef = collection(db, 'processedDocuments');
      const q = query(processedDocsRef, orderBy('processedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        processedAt: doc.data().processedAt.toDate()
      })) as ProcessedDocument[];
      
      setProcessedDocuments(docs);
    } catch (error) {
      console.error('Error loading processed documents:', error);
      toast.error('Erro ao carregar histórico de documentos');
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setExtractedData([]);
  };

  const processFiles = async () => {
    if (!selectedFiles.length) {
      toast.error('Selecione pelo menos um arquivo para processar');
      return;
    }

    setProcessing(true);
    toast.info('Iniciando processamento do documento...');
    
    try {
      const file = selectedFiles[0];
      const fileUrl = await uploadFile(file, `ocr/${file.name}`);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          fileUrl,
          prompt: `
            Analise este documento e extraia as seguintes informações no formato JSON:
            - Nome completo
            - Nacionalidade
            - Estado Civil
            - Profissão
            - RG
            - CPF
            - Endereço completo
            - Bairro
            - CEP
            - Cidade
            - Estado
            - Telefone (se disponível)
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar o documento');
      }

      const result = await response.json();
      const extractedFields: ExtractedField[] = Object.entries(result).map(([field, data]: [string, any]) => ({
        field,
        value: data.value,
        confidence: data.confidence,
      }));

      setExtractedData(extractedFields);

      // Salvar no Firestore
      const processedDoc: ProcessedDocument = {
        id: Date.now().toString(),
        name: file.name,
        processedAt: new Date(),
        extractedData: extractedFields,
      };

      await addDoc(collection(db, 'processedDocuments'), processedDoc);
      await loadProcessedDocuments(); // Recarrega a lista
      
      toast.success('Documento processado com sucesso!');
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      toast.error('Erro ao processar o documento');
    } finally {
      setProcessing(false);
    }
  };

  return {
    selectedFiles,
    processing,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles,
    loadProcessedDocuments
  };
};