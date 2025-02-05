import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedField } from '@/types/ocr';
import { toast } from 'sonner';

interface ProcessOptions {
  documentType: 'locador' | 'locatario' | 'fiador';
  maritalStatus: 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
  sharedAddress: boolean;
  needsGuarantor: boolean;
}

export const useOCR = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setExtractedData([]);
  };

  const processFiles = async (options: ProcessOptions) => {
    if (!selectedFiles.length) return;

    setProcessing(true);
    try {
      const file = selectedFiles[0];
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ocr_documents')
        .upload(`${Date.now()}_${file.name}`, file);

      if (uploadError) {
        throw new Error('Error uploading file');
      }

      // Process with OpenAI via Edge Function
      const { data: processedData, error } = await supabase.functions.invoke('process-ocr', {
        body: {
          documentType: options.documentType,
          base64Image: base64,
          maritalStatus: options.maritalStatus,
          sharedAddress: options.sharedAddress
        },
      });

      if (error) throw error;

      // Save to processed_documents table
      const { data: documentData, error: dbError } = await supabase
        .from('processed_documents')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          document_type: options.documentType,
          marital_status: options.maritalStatus,
          shared_address: options.sharedAddress,
          extracted_data: processedData.data,
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Format extracted data for display
      const formattedData = Object.entries(processedData.data).map(([field, value]) => ({
        field: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value as string,
        confidence: 0.95 // This is a placeholder - in a real implementation, we'd get this from the OCR service
      }));

      setExtractedData(formattedData);
      setProcessedDocuments(prev => [documentData, ...prev]);
      toast.success('Documento processado com sucesso!');
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Erro ao processar documento');
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