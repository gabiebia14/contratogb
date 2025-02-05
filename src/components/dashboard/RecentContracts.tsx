
import { Button } from "@/components/ui/button";

const mockData = {
  recentContracts: [
    { id: 1, name: 'Contrato de Prestação de Serviços', client: 'Empresa ABC Ltda', status: 'Ativo', date: '10 min atrás' },
    { id: 2, name: 'Termo de Confidencialidade', client: 'XYZ Corporação', status: 'Pendente', date: '15 min atrás' },
    { id: 3, name: 'Contrato de Parceria', client: 'Tech Solutions SA', status: 'Finalizado', date: '30 min atrás' },
  ]
};

export const RecentContracts = () => {
  return (
    <div>
      <h3 className="font-medium mb-4 text-gray-900">Contratos Recentes</h3>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="text-left text-gray-500 text-sm bg-gray-50">
              <tr>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockData.recentContracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="p-4 text-sm">{contract.name}</td>
                  <td className="p-4 text-sm">{contract.client}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contract.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                      contract.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{contract.date}</td>
                  <td className="p-4">
                    <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Ver detalhes
                    </Button>
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
