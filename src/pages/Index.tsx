
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContractsChart } from '@/components/dashboard/ContractsChart';
import { RecentContracts } from '@/components/dashboard/RecentContracts';
import { Card } from '@/components/ui/card';
import { FileText, FileUp, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/juridico/gerar-contrato">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Criar Contrato</h3>
                <p className="text-gray-500 text-sm">Gere um novo contrato a partir de modelos</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/juridico/documentos">
          <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-100 p-3 rounded-lg">
                <FileUp className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Extrair Documento</h3>
                <p className="text-gray-500 text-sm">Processe e extraia dados de documentos</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Contract Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-medium">Contratos Próximos do Vencimento</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((contract) => (
              <div key={contract} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">Contrato de Locação #{contract}</p>
                  <p className="text-sm text-gray-500">Vence em {contract * 5} dias</p>
                </div>
                <Link to={`/juridico/contracts/${contract}`} className="text-indigo-600 text-sm hover:text-indigo-800">
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-medium">Contratos Pendentes</h3>
          </div>
          <div className="space-y-4">
            {[1, 2].map((contract) => (
              <div key={contract} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">Contrato de Serviço #{contract}</p>
                  <p className="text-sm text-gray-500">Criado há {contract} dias</p>
                </div>
                <Link to={`/juridico/contracts/${contract}`} className="text-indigo-600 text-sm hover:text-indigo-800">
                  Continuar
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6">
        <StatsCards />
        <div className="grid md:grid-cols-2 gap-6">
          <ContractsChart />
          <RecentContracts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
