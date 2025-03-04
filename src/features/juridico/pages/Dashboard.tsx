
import { Card } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Jurídico</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Contratos Pendentes</h2>
          <p className="text-3xl font-bold">12</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Contratos Finalizados</h2>
          <p className="text-3xl font-bold">58</p>
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">Documentos</h2>
          <p className="text-3xl font-bold">24</p>
        </Card>
      </div>
    </div>
  );
}
