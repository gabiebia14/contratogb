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
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Contratos Recentes</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {mockData.recentContracts.map((contract) => (
          <div key={contract.id} className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 truncate">{contract.name}</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                contract.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                contract.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {contract.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{contract.client}</span>
              <span className="text-gray-500">{contract.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100">
        <Button variant="outline" className="w-full">
          Ver todos os contratos
        </Button>
      </div>
    </div>
  );
};