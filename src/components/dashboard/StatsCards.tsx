import { FileText, Clock, CheckCircle } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Ativos</p>
            <p className="text-2xl font-bold">234</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FileText className="text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Pendentes</p>
            <p className="text-2xl font-bold">56</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Clock className="text-yellow-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Vencidos</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <CheckCircle className="text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};