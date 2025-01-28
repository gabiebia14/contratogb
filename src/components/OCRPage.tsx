import React, { useState } from 'react';
import { Upload, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import FileUploadArea from './ocr/FileUploadArea';
import ExtractedDataDisplay from './ocr/ExtractedDataDisplay';

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

const OCRPage = () => {
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
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8">
        <FileUploadArea onFilesSelected={handleFilesSelected} />
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </p>
            <Button
              onClick={processFiles}
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

      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Instruções de Uso</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="text-indigo-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">1. Upload</h4>
            <p className="text-sm text-gray-600">
              Faça upload do documento que deseja processar
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
              <ScanLine className="text-cyan-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">2. Processamento</h4>
            <p className="text-sm text-gray-600">
              Nosso sistema irá processar e extrair as informações
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="text-green-600" size={20} />
            </div>
            <h4 className="font-medium mb-2">3. Resultado</h4>
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