import React, { useState } from 'react';
import { ScanLine, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FileUploadArea from './ocr/FileUploadArea';
import ExtractedDataDisplay from './ocr/ExtractedDataDisplay';
import { useOCR } from '@/hooks/useOCR';
import { toast } from 'sonner';

const OCRPage = () => {
  const {
    selectedFiles,
    processing,
    extractedData,
    processedDocuments,
    handleFilesSelected,
    processFiles
  } = useOCR();

  const [documentType, setDocumentType] = useState<'locador' | 'locatario' | 'fiador'>('locador');
  const [maritalStatus, setMaritalStatus] = useState<'solteiro' | 'casado' | 'divorciado' | 'viuvo'>('solteiro');
  const [sharedAddress, setSharedAddress] = useState(false);
  const [needsGuarantor, setNeedsGuarantor] = useState(false);

  const handleProcessFiles = async () => {
    if (!selectedFiles.length) {
      toast.error('Selecione pelo menos um arquivo para processar');
      return;
    }

    try {
      await processFiles({
        documentType,
        maritalStatus,
        sharedAddress,
        needsGuarantor
      });
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Erro ao processar os arquivos');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label>Tipo de Documento</Label>
              <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="locador">Locador</SelectItem>
                  <SelectItem value="locatario">Locatário</SelectItem>
                  <SelectItem value="fiador">Fiador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado Civil</Label>
              <Select value={maritalStatus} onValueChange={(value: any) => setMaritalStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado civil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {maritalStatus === 'casado' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="shared-address"
                  checked={sharedAddress}
                  onCheckedChange={setSharedAddress}
                />
                <Label htmlFor="shared-address">Endereço compartilhado com cônjuge</Label>
              </div>
            )}

            {documentType === 'locatario' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="needs-guarantor"
                  checked={needsGuarantor}
                  onCheckedChange={setNeedsGuarantor}
                />
                <Label htmlFor="needs-guarantor">Necessita de Fiador</Label>
              </div>
            )}
          </div>

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

      {processedDocuments.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-gray-500" />
            <h3 className="text-lg font-medium">Histórico de Documentos</h3>
          </div>
          
          <div className="space-y-4">
            {processedDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{doc.name}</h4>
                  <span className="text-sm text-gray-500">
                    {format(doc.processedAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <ExtractedDataDisplay data={doc.extractedData} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Instruções de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <ScanLine className="text-indigo-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">1. Configuração</h4>
            <p className="text-sm text-gray-600">
              Selecione o tipo de documento e as informações necessárias
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
              <ScanLine className="text-cyan-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">2. Upload</h4>
            <p className="text-sm text-gray-600">
              Faça upload do documento que deseja processar
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <ScanLine className="text-green-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">3. Processamento</h4>
            <p className="text-sm text-gray-600">
              Visualize e valide as informações extraídas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRPage;