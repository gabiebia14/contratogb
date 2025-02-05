
import { FileText, Clock, AlertCircle, Mail } from 'lucide-react';

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div className="bg-[#F97316] p-4 md:p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-100 text-sm mb-2">Entrevistas Agendadas</p>
            <p className="text-2xl md:text-3xl font-bold">86</p>
          </div>
          <div className="bg-[#FB923C] p-2 md:p-3 rounded-xl">
            <Clock className="text-white w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="bg-[#0EA5E9] p-4 md:p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-100 text-sm mb-2">Contratos Enviados</p>
            <p className="text-2xl md:text-3xl font-bold">75</p>
          </div>
          <div className="bg-[#38BDF8] p-2 md:p-3 rounded-xl">
            <FileText className="text-white w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="bg-[#F97316] p-4 md:p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-100 text-sm mb-2">Perfil Visualizado</p>
            <p className="text-2xl md:text-3xl font-bold">45,673</p>
          </div>
          <div className="bg-[#FB923C] p-2 md:p-3 rounded-xl">
            <AlertCircle className="text-white w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="bg-[#0EA5E9] p-4 md:p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-100 text-sm mb-2">Mensagens não lidas</p>
            <p className="text-2xl md:text-3xl font-bold">93</p>
          </div>
          <div className="bg-[#38BDF8] p-2 md:p-3 rounded-xl">
            <Mail className="text-white w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
