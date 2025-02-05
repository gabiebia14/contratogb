import React, { useState, useEffect } from 'react';
import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadArea from './ocr/FileUploadArea';
import ExtractedDataDisplay from './ocr/ExtractedDataDisplay';
import OCRForm from './ocr/OCRForm';
import Instructions from './ocr/Instructions';
import ProcessedHistory from './ocr/ProcessedHistory';
import { useOCR } from '@/hooks/useOCR';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DocumentRole, MaritalStatus, DocumentGender } from '@/types/ocr';

const OCRPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentRole>('locador');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('solteiro');
  const [documentGender, setDocumentGender] = useState<DocumentGender>('masculino');
  const [sharedAddress, setSharedAddress] = useState(false);
  const [needsGuarantor, setNeedsGuarantor] = useState(false);

  const {
    selectedFiles,
    processing,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles
  } = useOCR();

  useEffect(() => {
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setIsAuthenticated(true);
  };

  const handleProcessFiles = async () => {
    if (!selectedFiles.length) {
      toast.error('Selecione pelo menos um arquivo para processar');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Você precisa estar autenticado para fazer upload de arquivos');
      navigate('/auth');
      return;
    }

    try {
      await processFiles({
        documentType,
        maritalStatus,
        documentGender,
        sharedAddress,
        needsGuarantor
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Erro ao processar os arquivos');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <OCRForm
            documentType={documentType}
            setDocumentType={setDocumentType}
            maritalStatus={maritalStatus}
            setMaritalStatus={setMaritalStatus}
            documentGender={documentGender}
            setDocumentGender={setDocumentGender}
            sharedAddress={sharedAddress}
            setSharedAddress={setSharedAddress}
            needsGuarantor={needsGuarantor}
            setNeedsGuarantor={setNeedsGuarantor}
          />
          <FileUploadArea onFilesSelected={handleFilesSelected} />
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </p>
            <Button
              onClick={handleProcessFiles}
              disabled={processing}
            >
              {processing ? (
                <>Processando...</>
              ) : (
                <>
                  <ScanLine className="mr-2" />
                  Processar Documento
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {extractedData.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <ExtractedDataDisplay data={extractedData} />
        </div>
      )}

      <ProcessedHistory processedDocuments={processedDocuments} />
      <Instructions />
    </div>
  );
};

export default OCRPage;