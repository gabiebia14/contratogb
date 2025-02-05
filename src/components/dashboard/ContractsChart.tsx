
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const mockData = {
  processedContracts: [
    { date: 'Week 01', novos: 15, renovados: 10, encerrados: 5 },
    { date: 'Week 02', novos: 12, renovados: 8, encerrados: 6 },
    { date: 'Week 03', novos: 18, renovados: 12, encerrados: 8 },
    { date: 'Week 04', novos: 14, renovados: 9, encerrados: 4 },
    { date: 'Week 05', novos: 16, renovados: 11, encerrados: 7 },
    { date: 'Week 06', novos: 13, renovados: 10, encerrados: 6 },
    { date: 'Week 07', novos: 17, renovados: 13, encerrados: 5 },
    { date: 'Week 08', novos: 15, renovados: 12, encerrados: 7 },
    { date: 'Week 09', novos: 19, renovados: 14, encerrados: 8 },
    { date: 'Week 10', novos: 14, renovados: 11, encerrados: 6 },
  ],
};

export const ContractsChart = () => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-gray-900">Contratos por Período</h3>
          <select className="border rounded-lg px-3 py-1.5 text-sm">
            <option>Este Mês</option>
            <option>Último Mês</option>
            <option>Este Ano</option>
          </select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData.processedContracts}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar name="Novos" dataKey="novos" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar name="Renovados" dataKey="renovados" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              <Bar name="Encerrados" dataKey="encerrados" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
