
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Contracts() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <Button onClick={() => navigate('/juridico/gerar-contrato')}>
          Novo Contrato
        </Button>
      </div>
      <Card className="p-4">
        <p>Lista de contratos em desenvolvimento...</p>
      </Card>
    </div>
  );
}
