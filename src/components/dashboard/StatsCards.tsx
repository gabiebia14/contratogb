import { FileText, Clock, Users } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="rounded-xl p-6 bg-gradient-to-r from-pink-400 to-red-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">Contratos Ativos</p>
            <p className="text-3xl font-bold text-white">234</p>
            <p className="text-white/80 text-sm mt-2">Aumentou em 40%</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <FileText className="text-white h-6 w-6" />
          </div>
        </div>
      </div>
      
      <div className="rounded-xl p-6 bg-gradient-to-r from-blue-400 to-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">Contratos Pendentes</p>
            <p className="text-3xl font-bold text-white">56</p>
            <p className="text-white/80 text-sm mt-2">Diminuiu em 10%</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Clock className="text-white h-6 w-6" />
          </div>
        </div>
      </div>
      
      <div className="rounded-xl p-6 bg-gradient-to-r from-emerald-400 to-teal-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">Usuários Online</p>
            <p className="text-3xl font-bold text-white">95</p>
            <p className="text-white/80 text-sm mt-2">Aumentou em 5%</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Users className="text-white h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};