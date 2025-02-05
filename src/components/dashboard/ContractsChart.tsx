import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const mockData = {
  processedContracts: [
    { date: '1 Mar', novos: 15, renovados: 10, encerrados: 5 },
    { date: '2 Mar', novos: 12, renovados: 8, encerrados: 6 },
    { date: '3 Mar', novos: 18, renovados: 12, encerrados: 8 },
    { date: '4 Mar', novos: 14, renovados: 9, encerrados: 4 },
    { date: '5 Mar', novos: 16, renovados: 11, encerrados: 7 },
  ],
};

export const ContractsChart = () => {
  return (
    <div className="mb-8">
      <h3 className="font-medium mb-4 text-gray-900">Contratos por Período</h3>
      <div className="bg-white rounded-lg p-4 h-64 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData.processedContracts}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar name="Novos" dataKey="novos" fill="#4F46E5" />
            <Bar name="Renovados" dataKey="renovados" fill="#0EA5E9" />
            <Bar name="Encerrados" dataKey="encerrados" fill="#DC2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};