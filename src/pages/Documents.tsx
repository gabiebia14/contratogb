
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploadArea from '@/components/ocr/FileUploadArea';
import OCRForm from '@/components/ocr/OCRForm';
import ExtractedDataDisplay from '@/components/ocr/ExtractedDataDisplay';
import ProcessedHistory from '@/components/ocr/ProcessedHistory';
import { useOCR } from '@/hooks/useOCR';
import { DocumentRole, MaritalStatus } from '@/types/ocr';

const Documents = () => {
  const {
    selectedFiles,
    processing,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles
  } = useOCR();

  const [documentType, setDocumentType] = React.useState<DocumentRole>('locatario');
  const [maritalStatus, setMaritalStatus] = React.useState<MaritalStatus>('solteiro');
  const [sharedAddress, setSharedAddress] = React.useState(false);
  const [needsGuarantor, setNeedsGuarantor] = React.useState(false);

  const handleProcess = async () => {
    await processFiles({
      documentType,
      maritalStatus,
      sharedAddress,
      needsGuarantor
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documentos</h2>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
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
              <FileUploadArea onFilesSelected={handleFilesSelected} />
              {selectedFiles.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {processing ? 'Processando...' : 'Processar Documento'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {extractedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dados Extraídos</CardTitle>
              </CardHeader>
              <CardContent>
                <ExtractedDataDisplay data={extractedData} />
              </CardContent>
            </Card>
          )}

          {processedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Processamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProcessedHistory processedDocuments={processedDocuments} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessedHistory processedDocuments={processedDocuments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
