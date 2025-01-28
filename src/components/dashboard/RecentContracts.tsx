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
                  <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800">
                    Ver detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};