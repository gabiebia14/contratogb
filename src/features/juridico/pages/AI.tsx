import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessagesSquare, FileText } from 'lucide-react';

export default function AI() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-2xl font-bold">Assistente de IA</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <MessagesSquare className="h-12 w-12 text-blue-500" />
            <h3 className="text-xl font-semibold">Gerar Parametros de Modelos de Contrato</h3>
            <p className="text-muted-foreground">
              Assistente de IA para substituir os dados dos contratos por parametros.
            </p>
            <Button 
              onClick={() => navigate('/juridico/ai/chat')}
              size="lg"
              className="mt-4"
            >
              Começar
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <FileText className="h-12 w-12 text-blue-500" />
            <h3 className="text-xl font-semibold">Analisar Contrato</h3>
            <p className="text-muted-foreground">
              Análise rápida e precisa de contratos existentes usando inteligência artificial.
            </p>
            <Button 
              onClick={() => navigate('/juridico/ai/analisar')}
              size="lg"
              className="mt-4"
            >
              Começar
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <MessagesSquare className="h-12 w-12 text-blue-500" />
            <h3 className="text-xl font-semibold">Comparar Contratos</h3>
            <p className="text-muted-foreground">
              Compare contratos para encontrar diferencas.
            </p>
            <Button 
              onClick={() => navigate('/juridico/ai/comparar')}
              size="lg"
              className="mt-4"
            >
              Começar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
