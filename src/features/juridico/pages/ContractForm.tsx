
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function ContractForm() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Novo Contrato</h1>
        <Button variant="outline" onClick={() => navigate('/juridico/contracts')}>
          Voltar
        </Button>
      </div>
      <Card className="p-4">
        <p>Formulário de contrato em desenvolvimento...</p>
      </Card>
    </div>
  );
}
