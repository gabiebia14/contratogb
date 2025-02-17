
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            *,
            template:contract_templates(name),
            document:processed_documents(file_name)
          `)
          .eq('id', id)
          .maybeSingle(); // Usando maybeSingle() em vez de single()

        if (error) throw error;
        
        if (!data) {
          setError('Contrato não encontrado');
          toast.error('Contrato não encontrado');
          return;
        }

        setContract(data);
      } catch (err: any) {
        console.error('Erro ao buscar contrato:', err);
        setError('Erro ao carregar o contrato. Por favor, tente novamente mais tarde.');
        toast.error('Erro ao carregar o contrato');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContract();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => navigate('/juridico/contracts')}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Voltar para lista de contratos
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Contrato não encontrado</p>
            <button
              onClick={() => navigate('/juridico/contracts')}
              className="mt-4 text-indigo-600 hover:text-indigo-800"
            >
              Voltar para lista de contratos
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contract.title}</CardTitle>
        <div className="text-sm text-gray-500">
          Modelo: {contract.template?.name}
          <br />
          Documento: {contract.document?.file_name}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contract.content }} />
        </div>
      </CardContent>
    </Card>
  );
}
