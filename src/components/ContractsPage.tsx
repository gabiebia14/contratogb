import React, { useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';

const mockContracts = [
  {
    id: 1,
    name: 'Contrato de Prestação de Serviços',
    client: 'Empresa ABC Ltda',
    date: '15/03/2024',
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'Termo de Confidencialidade',
    client: 'XYZ Corporação',
    date: '14/03/2024',
    status: 'Pendente'
  },
  {
    id: 3,
    name: 'Contrato de Parceria',
    client: 'Tech Solutions SA',
    date: '13/03/2024',
    status: 'Finalizado'
  }
];

const ContractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || contract.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar contratos..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Novo Contrato
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-gray-500 text-sm">
              <tr>
                <th className="pb-4">Nome</th>
                <th className="pb-4">Cliente</th>
                <th className="pb-4">Data</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-t">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600" size={16} />
                      </div>
                      {contract.name}
                    </div>
                  </td>
                  <td className="py-4">{contract.client}</td>
                  <td className="py-4">{contract.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      contract.status === 'Ativo' ? 'bg-green-100 text-green-600' :
                      contract.status === 'Pendente' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                        <Download size={20} className="text-gray-500" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        Ver detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractsPage;