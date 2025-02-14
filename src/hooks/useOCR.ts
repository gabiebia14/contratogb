import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedField, DocumentRole, DocumentType, MaritalStatus } from '@/types/ocr';
import { toast } from 'sonner';

interface ProcessOptions {
  documentType: DocumentRole;
  documentCategory: DocumentType;
  maritalStatus: MaritalStatus;
  sharedAddress: boolean;
  needsGuarantor: boolean;
}

export const useOCR = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProcessedDocuments();
      } else {
        setLoading(false);
        toast.error('Por favor, faça login para ver os documentos');
      }
    };

    checkAuthAndFetch();
  }, []);

  const fetchProcessedDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('processed_documents')
        .select('*')
        .order('processed_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Documentos carregados:', data);
      setProcessedDocuments(data || []);
    } catch (error) {
      console.error('Error fetching processed documents:', error);
      toast.error('Erro ao carregar documentos processados');
    } finally {
      setLoading(false);
    }
  };

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
    if (!selectedFiles.length) {
      toast.error('Selecione um arquivo para processar');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Você precisa estar autenticado para fazer upload de arquivos');
      return;
    }

    setProcessing(true);
    try {
      const file = selectedFiles[0];
      
      // Validar tamanho do arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('O arquivo deve ter no máximo 10MB');
      }

      // Validar tipo do arquivo
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        throw new Error('Formato de arquivo não suportado. Use JPEG, PNG ou PDF');
      }

      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFileName(file.name);
      const finalFileName = `${timestamp}_${sanitizedFileName}`;
      
      // Converter arquivo para base64 com tratamento de erro
      let base64;
      try {
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      } catch (error) {
        throw new Error('Erro ao converter arquivo para base64');
      }

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

      // Process with Edge Function
      const { data: processedData, error } = await supabase.functions.invoke('process-ocr', {
        body: {
          documentType: options.documentType,
          documentCategory: options.documentCategory,
          base64Image: base64,
          maritalStatus: options.maritalStatus,
          sharedAddress: options.sharedAddress
        },
      });

      if (error) {
        console.error('Erro detalhado da Edge Function:', error);
        throw new Error(`Erro no processamento: ${error.message}`);
      }

      console.log('Dados brutos recebidos da Edge Function:', processedData);

      // Certifique-se de que temos dados válidos
      if (!processedData?.data) {
        throw new Error('Nenhum dado foi extraído do documento');
      }

      // Format extracted data for database
      const extractedDataObject = processedData.data;
      console.log('Dados extraídos formatados para o banco:', extractedDataObject);

      // Save to processed_documents table
      const { data: documentData, error: dbError } = await supabase
        .from('processed_documents')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          document_role: options.documentType,
          document_type: options.documentCategory,
          marital_status: options.maritalStatus,
          shared_address: options.sharedAddress,
          extracted_data: extractedDataObject,
          status: 'completed',
          processed_at: new Date().toISOString(),
          user_id: session.user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro no banco de dados:', dbError);
        throw dbError;
      }

      // Format extracted data for display
      const fields: ExtractedField[] = [{
        field: 'extracted_data',
        value: extractedDataObject,
        confidence: 1
      }];

      console.log('Dados formatados para exibição:', fields);
      setExtractedData(fields);
      
      // Update the processed documents list
      await fetchProcessedDocuments();
      
      toast.success('Documento processado com sucesso!');
    } catch (error: any) {
      console.error('Erro detalhado ao processar documento:', error);
      toast.error(`Erro ao processar documento: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return {
    selectedFiles,
    processing,
    loading,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles
  };
};
