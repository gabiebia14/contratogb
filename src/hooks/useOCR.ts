
import { useState, useEffect, useRef } from 'react';
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

// Type guard to check if an object is an ExtractedField
const isExtractedField = (item: any): item is ExtractedField => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'field' in item &&
    'value' in item &&
    'confidence' in item &&
    typeof item.field === 'string' &&
    typeof item.value === 'string' &&
    typeof item.confidence === 'number'
  );
};

export const useOCR = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const mountedRef = useRef(true);
  const { uploadFile } = useStorage();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProcessedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!mountedRef.current) return;

      const docs = data.map(doc => ({
        id: doc.id,
        name: doc.file_name,
        processedAt: new Date(doc.processed_at || doc.created_at),
        extractedData: Array.isArray(doc.extracted_data) 
          ? doc.extracted_data.filter(isExtractedField)
          : []
      }));

      setProcessedDocuments(docs);
    } catch (error) {
      console.error('Error loading processed documents:', error);
      if (mountedRef.current) {
        toast.error('Erro ao carregar histórico de documentos');
      }
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (mountedRef.current) {
      setSelectedFiles(files);
      setExtractedData([]);
    }
  };

  const processFiles = async () => {
    if (!selectedFiles.length) {
      toast.error('Selecione pelo menos um arquivo para processar');
      return;
    }

    if (!mountedRef.current) return;
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

      if (!mountedRef.current) return;

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

      if (mountedRef.current) {
        await loadProcessedDocuments();
        toast.success('Documento processado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      if (mountedRef.current) {
        toast.error('Erro ao processar o documento');
      }
    } finally {
      if (mountedRef.current) {
        setProcessing(false);
      }
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
