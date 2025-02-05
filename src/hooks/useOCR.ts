
import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedField } from '@/types/ocr';
import { useStorage } from './useStorage';
import { supabase } from '@/integrations/supabase/client';

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

  const loadProcessedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const docs = data.map(doc => ({
        id: doc.id,
        name: doc.file_name,
        processedAt: new Date(doc.processed_at || doc.created_at),
        extractedData: Array.isArray(doc.extracted_data) 
          ? (doc.extracted_data as ExtractedField[])
          : []
      }));

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
      const fileUrl = await uploadFile(file, 'ocr');

      const response = await supabase.functions.invoke('process-ocr', {
        body: { fileUrl }
      });

      if (response.error) {
        throw new Error('Falha ao processar o documento');
      }

      const extractedFields = Object.entries(response.data).map(([field, data]: [string, any]) => ({
        field,
        value: data.value,
        confidence: data.confidence,
      }));

      setExtractedData(extractedFields);

      // Salvar no Supabase
      const { error: insertError } = await supabase
        .from('processed_documents')
        .insert({
          file_name: file.name,
          file_path: fileUrl,
          file_type: file.type,
          extracted_data: extractedFields,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      await loadProcessedDocuments();
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
