import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CompararContratos() {
  const [contrato1, setContrato1] = useState('');
  const [contrato2, setContrato2] = useState('');
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);

  const compararContratos = async () => {
    if (!contrato1 || !contrato2) {
      toast.error('Por favor, insira ambos os contratos para comparação');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://gzamgeekhujhorkggjnl.supabase.co/functions/v1/comparar-contratos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contrato1,
          contrato2,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao comparar contratos');
      
      setResultado(data.análise);
      toast.success('Comparação realizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao comparar os contratos: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-2xl font-bold">Comparar Contratos</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contrato 1</h3>
          <Textarea
            placeholder="Cole o texto do primeiro contrato aqui..."
            className="min-h-[300px]"
            value={contrato1}
            onChange={(e) => setContrato1(e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contrato 2</h3>
          <Textarea
            placeholder="Cole o texto do segundo contrato aqui..."
            className="min-h-[300px]"
            value={contrato2}
            onChange={(e) => setContrato2(e.target.value)}
          />
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={compararContratos}
          disabled={loading || !contrato1 || !contrato2}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comparando contratos...
            </>
          ) : (
            'Comparar Contratos'
          )}
        </Button>
      </div>

      {resultado && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultado da Comparação</h3>
          <div className="whitespace-pre-wrap">{resultado}</div>
        </Card>
      )}
    </div>
  );
}
