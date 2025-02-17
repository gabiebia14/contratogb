
import React, { useState, useEffect } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const ContractsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          template:contract_templates(name),
          document:processed_documents(file_name)
        `);
      if (error) {
        console.error('Error fetching contracts:', error);
      } else {
        setContracts(data || []);
      }
    };
    fetchContracts();
  }, []);

  const handleViewContract = (contractId: string) => {
    navigate(`/juridico/contracts/${contractId}`);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || contract.status === statusFilter;
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
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="expired">Expirado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button 
              onClick={() => navigate('/juridico/new-contract')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Novo Contrato
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-gray-500 text-sm">
              <tr>
                <th className="pb-4">Nome</th>
                <th className="pb-4">Modelo</th>
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
                      {contract.title}
                    </div>
                  </td>
                  <td className="py-4">{contract.template?.name}</td>
                  <td className="py-4">{new Date(contract.created_at).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      contract.status === 'active' ? 'bg-green-100 text-green-600' :
                      contract.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      contract.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      contract.status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {contract.status === 'active' ? 'Ativo' :
                       contract.status === 'pending' ? 'Pendente' :
                       contract.status === 'draft' ? 'Rascunho' :
                       contract.status === 'expired' ? 'Expirado' :
                       contract.status === 'cancelled' ? 'Cancelado' : 
                       contract.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                        <Download size={20} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => handleViewContract(contract.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
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
