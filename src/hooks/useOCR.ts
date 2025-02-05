import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedField } from '@/types/ocr';
import { useStorage } from './useStorage';

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
      
      // Upload do arquivo para obter a URL
      const fileUrl = await uploadFile(file, `ocr/${file.name}`);

      // Preparar o prompt para o modelo
      const prompt = `
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

        Retorne apenas o JSON com os campos encontrados e a confiança da extração para cada campo.
      `;

      // Fazer a chamada para a API com o modelo gpt-4o-mini
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          fileUrl,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar o documento');
      }

      const result = await response.json();

      // Converter o resultado para o formato ExtractedField[]
      const extractedFields: ExtractedField[] = Object.entries(result).map(([field, data]: [string, any]) => ({
        field,
        value: data.value,
        confidence: data.confidence,
      }));

      setExtractedData(extractedFields);

      // Adicionar ao histórico
      const processedDoc: ProcessedDocument = {
        id: Date.now().toString(),
        name: file.name,
        processedAt: new Date(),
        extractedData: extractedFields,
      };

      setProcessedDocuments(prev => [processedDoc, ...prev]);
      
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
    processFiles
  };
};