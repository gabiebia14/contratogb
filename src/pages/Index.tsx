import React, { useState } from 'react';
import { FileText, Upload, Settings, HelpCircle, Bell, Search, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const mockData = {
  processedContracts: [
    { date: '1 Mar', novos: 15, renovados: 10, encerrados: 5 },
    { date: '2 Mar', novos: 12, renovados: 8, encerrados: 6 },
    { date: '3 Mar', novos: 18, renovados: 12, encerrados: 8 },
    { date: '4 Mar', novos: 14, renovados: 9, encerrados: 4 },
    { date: '5 Mar', novos: 16, renovados: 11, encerrados: 7 },
  ],
  recentContracts: [
    { id: 1, name: 'Contrato de Prestação de Serviços', client: 'Empresa ABC Ltda', status: 'Ativo', date: '10 min atrás' },
    { id: 2, name: 'Termo de Confidencialidade', client: 'XYZ Corporação', status: 'Pendente', date: '15 min atrás' },
    { id: 3, name: 'Contrato de Parceria', client: 'Tech Solutions SA', status: 'Finalizado', date: '30 min atrás' },
  ]
};

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6">
        <div className="mb-12">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-cyan-400">▲</span> ContractPro
          </h1>
        </div>

        <div className="space-y-6">
          <div className="text-gray-400 text-sm">GERENCIAR</div>
          <div className="space-y-4">
            <button 
              className="flex items-center gap-3 w-full bg-white text-indigo-700 p-2 rounded"
            >
              <FileText size={20} />
              <span>Contratos</span>
            </button>
            <button 
              className="flex items-center gap-3 w-full hover:bg-indigo-600 p-2 rounded"
            >
              <Upload size={20} />
              <span>Novo Contrato</span>
            </button>
            <button 
              className="flex items-center gap-3 w-full hover:bg-indigo-600 p-2 rounded"
            >
              <Settings size={20} />
              <span>Configurações</span>
            </button>
          </div>

          <div className="text-gray-400 text-sm pt-4">SUPORTE</div>
          <div className="space-y-4">
            <button className="flex items-center gap-3 w-full hover:bg-indigo-600 p-2 rounded">
              <HelpCircle size={20} />
              <span>Ajuda</span>
            </button>
          </div>
        </div>

        <div className="mt-auto pt-12">
          <div className="bg-indigo-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">Tutorial</h3>
            <p className="text-sm text-gray-300 mb-4">Aprenda a gerenciar contratos</p>
            <button className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm">
              Começar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400" />
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Contratos Ativos</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Contratos Pendentes</p>
                <p className="text-2xl font-bold">56</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Taxa de Renovação</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <h3 className="font-medium mb-4">Contratos por Período</h3>
          <div className="bg-white rounded-lg p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.processedContracts}>
                <XAxis dataKey="date" />
                <YAxis />
                <Bar dataKey="novos" fill="#06B6D4" />
                <Bar dataKey="renovados" fill="#6366F1" />
                <Bar dataKey="encerrados" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Contracts */}
        <div>
          <h3 className="font-medium mb-4">Contratos Recentes</h3>
          <div className="bg-white rounded-lg">
            <table className="w-full">
              <thead className="text-left text-gray-500 text-sm">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockData.recentContracts.map((contract) => (
                  <tr key={contract.id} className="border-t">
                    <td className="p-4">{contract.name}</td>
                    <td className="p-4">{contract.client}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        contract.status === 'Ativo' ? 'bg-green-100 text-green-600' :
                        contract.status === 'Pendente' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{contract.date}</td>
                    <td className="p-4">
                      <button className="text-indigo-600 hover:text-indigo-800">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-gray-100 p-6">
        <h3 className="text-lg font-medium mb-6">Estatísticas</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">45</div>
                <div className="text-gray-500 text-sm">Dias até próxima renovação</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-white" size={20} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">8</div>
                <div className="text-gray-500 text-sm">Contratos vencendo</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Tipos de Contratos</h3>
          <div className="bg-white rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Prestação de Serviços</span>
                <span className="text-indigo-600 font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Termos de Uso</span>
                <span className="text-indigo-600 font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Parcerias</span>
                <span className="text-indigo-600 font-medium">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;