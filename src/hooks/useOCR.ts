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
      const file = selectedFiles[0];
      const reader = new FileReader();
      
      reader.onload = async () => {
        // Aqui você pode implementar a lógica real de OCR
        // Por enquanto, vamos apenas simular a extração de texto do documento
        const extractedFields: ExtractedField[] = [];
        
        // Exemplo de extração de texto básica
        // Em um caso real, você usaria uma API de OCR como Tesseract.js ou um serviço em nuvem
        const text = await simulateTextExtraction(file);
        
        // Procura por padrões nos textos extraídos
        if (text.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) {
          extractedFields.push({
            field: "Nome completo",
            value: text.match(/[A-Z][a-z]+ [A-Z][a-z]+/)?.[0] || "",
            confidence: 0.85
          });
        }

        // CPF (formato: 000.000.000-00)
        const cpfMatch = text.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
        if (cpfMatch) {
          extractedFields.push({
            field: "CPF",
            value: cpfMatch[0],
            confidence: 0.95
          });
        }

        // RG (formato básico: 00.000.000-0)
        const rgMatch = text.match(/\d{2}\.\d{3}\.\d{3}-[\dX]/);
        if (rgMatch) {
          extractedFields.push({
            field: "RG",
            value: rgMatch[0],
            confidence: 0.90
          });
        }

        // CEP (formato: 00000-000)
        const cepMatch = text.match(/\d{5}-\d{3}/);
        if (cepMatch) {
          extractedFields.push({
            field: "CEP",
            value: cepMatch[0],
            confidence: 0.92
          });
        }

        // Telefone (formato: (00) 00000-0000)
        const phoneMatch = text.match(/\(\d{2}\) \d{5}-\d{4}/);
        if (phoneMatch) {
          extractedFields.push({
            field: "Telefone",
            value: phoneMatch[0],
            confidence: 0.88
          });
        }

        setExtractedData(extractedFields);
        toast.success('Documento processado com sucesso!');
      };

      reader.onerror = () => {
        toast.error('Erro ao ler o arquivo');
      };

      reader.readAsText(file);
    } catch (error) {
      toast.error('Erro ao processar o documento');
      console.error('OCR processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Função auxiliar para simular extração de texto
  const simulateTextExtraction = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.readAsText(file);
    });
  };

  return {
    selectedFiles,
    processing,
    extractedData,
    handleFilesSelected,
    processFiles
  };
};