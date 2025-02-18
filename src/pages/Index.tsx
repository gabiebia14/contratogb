
import { Card } from '@/components/ui/card';
import { FileText, AlertCircle, Clock, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Dashboard() {
  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral dos seus contratos e atividades</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contratos Pendentes</p>
              <p className="text-2xl font-semibold mt-1">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assinaturas Pendentes</p>
              <p className="text-2xl font-semibold mt-1">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contratos Ativos</p>
              <p className="text-2xl font-semibold mt-1">127</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Próximos do Vencimento</p>
              <p className="text-2xl font-semibold mt-1">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contratos Pendentes Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Contratos Pendentes</h3>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Contrato de Prestação de Serviços</p>
                <p className="text-sm text-gray-500">Solicitado por: Maria Santos</p>
              </div>
            </div>
            <Button className="w-full sm:w-auto">Iniciar</Button>
          </div>
        </Card>
      </div>

      {/* Contratos Próximos da Validade */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Contratos Próximos da Validade</h3>
        <Card className="p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="text-sm text-gray-500 border-b">
                <tr>
                  <th className="text-left pb-3">CONTRATO</th>
                  <th className="text-left pb-3">CLIENTE</th>
                  <th className="text-left pb-3">DATA DE VENCIMENTO</th>
                  <th className="text-left pb-3">STATUS</th>
                  <th className="text-left pb-3">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Contrato de Locação
                    </div>
                  </td>
                  <td className="py-4">Empresa ABC</td>
                  <td className="py-4 text-red-500">Em 5 dias</td>
                  <td className="py-4">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                      Expirando
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <FileCheck className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
