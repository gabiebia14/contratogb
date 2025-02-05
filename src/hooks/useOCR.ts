import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedField, DocumentRole, MaritalStatus, DocumentGender } from '@/types/ocr';
import { toast } from 'sonner';

interface ProcessOptions {
  documentType: DocumentRole;
  maritalStatus: MaritalStatus;
  documentGender: DocumentGender;
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

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_');
  };

  const processFiles = async (options: ProcessOptions) => {
    if (!selectedFiles.length) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar autenticado para fazer upload de arquivos');
      return;
    }

    setProcessing(true);
    try {
      const file = selectedFiles[0];
      
      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFileName(file.name);
      const finalFileName = `${timestamp}_${sanitizedFileName}`;
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      console.log('Iniciando upload do arquivo...');
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ocr_documents')
        .upload(finalFileName, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error('Erro ao fazer upload do arquivo: ' + uploadError.message);
      }

      console.log('Arquivo enviado com sucesso:', uploadData);

      // Process with OpenAI via Edge Function
      const { data: processedData, error } = await supabase.functions.invoke('process-ocr', {
        body: {
          documentType: options.documentType,
          base64Image: base64,
          maritalStatus: options.maritalStatus,
          documentGender: options.documentGender,
          sharedAddress: options.sharedAddress
        },
      });

      if (error) {
        console.error('Erro no processamento:', error);
        throw error;
      }

      console.log('Documento processado com sucesso:', processedData);

      // Save to processed_documents table
      const { data: documentData, error: dbError } = await supabase
        .from('processed_documents')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          document_type: options.documentType,
          document_gender: options.documentGender,
          marital_status: options.maritalStatus,
          shared_address: options.sharedAddress,
          extracted_data: processedData.data,
          extracted_fields: processedData.data,
          status: 'completed',
          processed_at: new Date().toISOString(),
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro no banco de dados:', dbError);
        throw dbError;
      }

      // Format extracted data for display
      const formattedData = Object.entries(processedData.data).map(([field, value]) => ({
        field: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value as string,
        confidence: 0.95
      }));

      setExtractedData(formattedData);
      setProcessedDocuments(prev => [documentData, ...prev]);
      toast.success('Documento processado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      toast.error('Erro ao processar documento: ' + (error.message || 'Erro desconhecido'));
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