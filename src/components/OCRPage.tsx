import React, { useState } from 'react';
import { Upload, ScanLine } from 'lucide-react';
import { toast } from 'sonner';

const OCRPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setProcessing(true);
    toast.info('Iniciando processamento do documento...');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    toast.success('Documento processado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="ocrFileInput"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <label
            htmlFor="ocrFileInput"
            className="cursor-pointer block"
          >
            <ScanLine className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Arraste documentos ou clique para fazer upload
            </h3>
            <p className="text-sm text-gray-500">
              Suporte para PDF, PNG, JPG (max. 10MB)
            </p>
          </label>
        </div>
      </div>

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