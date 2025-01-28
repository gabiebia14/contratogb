import React from 'react';
import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadArea from './ocr/FileUploadArea';
import ExtractedDataDisplay from './ocr/ExtractedDataDisplay';
import { useOCR } from '@/hooks/useOCR';

const OCRPage = () => {
  const {
    selectedFiles,
    processing,
    extractedData,
    handleFilesSelected,
    processFiles
  } = useOCR();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
              <ScanLine className="text-indigo-600" size={20} />
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
              <ScanLine className="text-green-600" size={20} />
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