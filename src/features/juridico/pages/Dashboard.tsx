
import { Card } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ContractsChart } from "@/components/dashboard/ContractsChart";
import { RecentContracts } from "@/components/dashboard/RecentContracts";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Jurídico</h1>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contratos por Mês</h2>
          <div className="h-80">
            <ContractsChart />
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contratos Recentes</h2>
          <RecentContracts />
        </Card>
      </div>
    </div>
  );
}
