import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedField } from '@/types/ocr';

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
      
      // Simular extração de dados do documento
      // Em um caso real, você usaria uma API de OCR
      const extractedFields: ExtractedField[] = [
        {
          field: "Nome completo",
          value: "João da Silva",
          confidence: 0.95
        },
        {
          field: "CPF",
          value: "123.456.789-00",
          confidence: 0.98
        },
        {
          field: "RG",
          value: "12.345.678-9",
          confidence: 0.92
        }
      ];

      setExtractedData(extractedFields);

      // Adicionar ao histórico
      const processedDoc: ProcessedDocument = {
        id: Date.now().toString(),
        name: file.name,
        processedAt: new Date(),
        extractedData: extractedFields
      };

      setProcessedDocuments(prev => [processedDoc, ...prev]);
      
      toast.success('Documento processado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar o documento');
      console.error('OCR processing error:', error);
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
    processFiles
  };
};