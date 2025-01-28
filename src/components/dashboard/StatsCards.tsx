import { FileText, Clock, AlertCircle } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Ativos</p>
            <p className="text-2xl font-bold text-indigo-600">234</p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg">
            <FileText className="text-indigo-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Pendentes</p>
            <p className="text-2xl font-bold text-amber-600">56</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg">
            <Clock className="text-amber-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Contratos Vencidos</p>
            <p className="text-2xl font-bold text-red-600">12</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertCircle className="text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};