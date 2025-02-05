import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const mockData = {
  processedContracts: [
    { date: 'JAN', novos: 15, renovados: 10, encerrados: 5 },
    { date: 'FEV', novos: 12, renovados: 8, encerrados: 6 },
    { date: 'MAR', novos: 18, renovados: 12, encerrados: 8 },
    { date: 'ABR', novos: 14, renovados: 9, encerrados: 4 },
    { date: 'MAI', novos: 16, renovados: 11, encerrados: 7 },
    { date: 'JUN', novos: 20, renovados: 15, encerrados: 9 },
    { date: 'JUL', novos: 22, renovados: 17, encerrados: 11 },
    { date: 'AGO', novos: 19, renovados: 13, encerrados: 8 },
  ],
};

export const ContractsChart = () => {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Estatísticas de Contratos</h3>
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-sm text-gray-600">Novos</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              <span className="text-sm text-gray-600">Renovados</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="text-sm text-gray-600">Encerrados</span>
            </span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData.processedContracts}>
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Bar name="Novos" dataKey="novos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar name="Renovados" dataKey="renovados" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar name="Encerrados" dataKey="encerrados" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};