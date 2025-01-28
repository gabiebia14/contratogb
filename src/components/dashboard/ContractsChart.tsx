import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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
  );
};