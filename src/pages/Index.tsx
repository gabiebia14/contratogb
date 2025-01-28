import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContractsChart } from '@/components/dashboard/ContractsChart';
import { RecentContracts } from '@/components/dashboard/RecentContracts';

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <StatsCards />
      <ContractsChart />
      <RecentContracts />
    </div>
  );
}

export default Dashboard;