
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContractsChart } from '@/components/dashboard/ContractsChart';
import { RecentContracts } from '@/components/dashboard/RecentContracts';
import { Search } from 'lucide-react';

function Dashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Bem-vindo de volta, João!</p>
        </div>
      </div>
      <StatsCards />
      <ContractsChart />
      <RecentContracts />
    </div>
  );
}

export default Dashboard;
