import React from 'react';
import { FileText, Download, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mockTemplates = [
  {
    id: 1,
    name: 'Contrato de Prestação de Serviços',
    category: 'Serviços',
    lastModified: '15/03/2024',
    downloads: 128
  },
  {
    id: 2,
    name: 'Termo de Confidencialidade',
    category: 'Legal',
    lastModified: '14/03/2024',
    downloads: 85
  },
  {
    id: 3,
    name: 'Contrato de Parceria Comercial',
    category: 'Comercial',
    lastModified: '13/03/2024',
    downloads: 234
  },
  {
    id: 4,
    name: 'Contrato de Trabalho CLT',
    category: 'RH',
    lastModified: '12/03/2024',
    downloads: 456
  }
];

const ContractTemplates = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modelos de Contratos</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar modelos..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-4">
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue="todos"
            >
              <option value="todos">Todas as categorias</option>
              <option value="servicos">Serviços</option>
              <option value="legal">Legal</option>
              <option value="comercial">Comercial</option>
              <option value="rh">RH</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Última modificação: {template.lastModified}</span>
                <span>{template.downloads} downloads</span>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContractTemplates;