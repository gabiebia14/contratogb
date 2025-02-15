import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FileUploadArea from '@/components/ocr/FileUploadArea';
import OCRForm from '@/components/ocr/OCRForm';
import ExtractedDataDisplay from '@/components/ocr/ExtractedDataDisplay';
import ProcessedHistory from '@/components/ocr/ProcessedHistory';
import { useOCR } from '@/hooks/useOCR';
import { DocumentRole, DocumentType, MaritalStatus } from '@/types/ocr';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Documents = () => {
  const {
    selectedFiles,
    processing,
    loading,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles,
    setProcessedDocuments
  } = useOCR();

  const [documentType, setDocumentType] = useState<DocumentRole>('locatario');
  const [documentCategory, setDocumentCategory] = useState<DocumentType>('documentos_pessoais');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('solteiro');
  const [sharedAddress, setSharedAddress] = useState(false);
  const [needsGuarantor, setNeedsGuarantor] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleProcess = async () => {
    if (!selectedFiles.length) {
      toast.error('Por favor, selecione um arquivo para processar');
      return;
    }

    try {
      await processFiles({
        documentType,
        documentCategory,
        maritalStatus,
        sharedAddress,
        needsGuarantor
      });
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Ocorreu um erro ao processar o documento');
    }
  };

  const handleDocumentDelete = (docId: string) => {
    setProcessedDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
  };

  const getCurrentDateTime = () => {
    return format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
            <p className="text-sm text-gray-500 mt-1">
              {getCurrentDateTime()}
            </p>
          </div>
        </div>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="upload">Upload e Processamento</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <OCRForm
                  documentType={documentType}
                  setDocumentType={setDocumentType}
                  documentCategory={documentCategory}
                  setDocumentCategory={setDocumentCategory}
                  maritalStatus={maritalStatus}
                  setMaritalStatus={setMaritalStatus}
                  sharedAddress={sharedAddress}
                  setSharedAddress={setSharedAddress}
                  needsGuarantor={needsGuarantor}
                  setNeedsGuarantor={setNeedsGuarantor}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload de Documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUploadArea 
                  onFilesSelected={handleFilesSelected}
                />
                {selectedFiles.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleProcess}
                      disabled={processing}
                      className="bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Processar Documento'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {extractedData.length > 0 && (
              <ExtractedDataDisplay data={extractedData} />
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : processedDocuments.length > 0 ? (
                  <ProcessedHistory 
                    processedDocuments={processedDocuments}
                    onDelete={handleDocumentDelete}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum documento processado encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t p-2">
          <div className="container mx-auto max-w-4xl flex justify-between items-center text-sm text-gray-600">
            <div>
              Status: {loading ? 'Carregando...' : 'Pronto'}
            </div>
            <div>
              Documentos processados: {processedDocuments.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
