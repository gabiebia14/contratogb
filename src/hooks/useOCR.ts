import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedField } from '@/types/ocr';

export const useOCR = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);

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
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted data with different confidence levels
      const mockData: ExtractedField[] = [
        {
          field: "Nome completo",
          value: "João Silva Santos",
          confidence: 0.98
        },
        {
          field: "CPF",
          value: "123.456.789-00",
          confidence: 0.95
        },
        {
          field: "RG",
          value: "12.345.678-9",
          confidence: 0.93
        },
        {
          field: "Data de nascimento",
          value: "15/03/1985",
          confidence: 0.89
        },
        {
          field: "Nacionalidade",
          value: "Brasileira",
          confidence: 0.87
        },
        {
          field: "Profissão",
          value: "Engenheiro",
          confidence: 0.85
        },
        {
          field: "Endereço",
          value: "Rua das Flores, 123",
          confidence: 0.82
        },
        {
          field: "Bairro",
          value: "Centro",
          confidence: 0.84
        },
        {
          field: "CEP",
          value: "12345-678",
          confidence: 0.91
        },
        {
          field: "Cidade",
          value: "São Paulo",
          confidence: 0.88
        },
        {
          field: "Estado",
          value: "SP",
          confidence: 0.92
        },
        {
          field: "Telefone",
          value: "(11) 98765-4321",
          confidence: 0.86
        }
      ];
      
      setExtractedData(mockData);
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
    handleFilesSelected,
    processFiles
  };
};