import React from 'react';
import { ScanLine } from 'lucide-react';

const Instructions = () => {
  return (
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
  );
};

export default Instructions;