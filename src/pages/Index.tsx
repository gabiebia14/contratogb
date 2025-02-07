
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ContractsChart } from '@/components/dashboard/ContractsChart';
import { RecentContracts } from '@/components/dashboard/RecentContracts';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <div className="grid gap-6">
        <StatsCards />
        <div className="grid md:grid-cols-2 gap-6">
          <ContractsChart />
          <RecentContracts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
