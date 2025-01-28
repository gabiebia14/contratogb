import { FileText, Upload, Settings, HelpCircle, Bell, Clock, AlertCircle } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContractsChart } from '@/components/dashboard/ContractsChart';
import { RecentContracts } from '@/components/dashboard/RecentContracts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Dashboard() {
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
            <Button 
              className="flex items-center gap-3 w-full hover:bg-indigo-600 p-2 rounded"
              asChild
            >
              <Link to="/novo-contrato">
                <Upload size={20} />
                <span>Novo Contrato</span>
              </Link>
            </Button>
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

        <StatsCards />
        <ContractsChart />
        <RecentContracts />
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