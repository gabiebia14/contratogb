
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Função auxiliar para validar UUID
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Função para buscar contrato com retentativas
const fetchContractWithRetry = async (id: string, maxAttempts = 5) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    console.log(`Tentativa ${attempts + 1} de buscar contrato ${id}`);
    
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        template:contract_templates(name),
        document:processed_documents(file_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar contrato:', error);
      throw error;
    }

    if (data) {
      console.log('Contrato encontrado:', data);
      return data;
    }

    attempts++;
    if (attempts < maxAttempts) {
      console.log(`Aguardando 1 segundo antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Contrato não encontrado após várias tentativas');
};

export default function ContractViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContract = async () => {
      try {
        if (!id || !isValidUUID(id)) {
          setError('ID do contrato inválido');
          toast.error('ID do contrato inválido');
          return;
        }

        console.log('Iniciando busca do contrato:', id);
        const contractData = await fetchContractWithRetry(id);
        
        if (!contractData) {
          setError('Contrato não encontrado');
          toast.error('Contrato não encontrado');
          return;
        }

        setContract(contractData);
        console.log('Contrato carregado com sucesso:', contractData);
      } catch (err: any) {
        console.error('Erro ao buscar contrato:', err);
        setError('Erro ao carregar o contrato. Por favor, tente novamente mais tarde.');
        toast.error('Erro ao carregar o contrato: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [id, navigate]);

  // Inscreve-se para atualizações em tempo real do contrato
  useEffect(() => {
    if (!id) return;

    const contractSubscription = supabase
      .channel('contract_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'contracts',
          filter: `id=eq.${id}` 
        }, 
        (payload) => {
          console.log('Atualização do contrato detectada:', payload);
          // Recarrega o contrato quando houver mudanças
          fetchContractWithRetry(id)
            .then(data => setContract(data))
            .catch(error => console.error('Erro ao atualizar contrato:', error));
        }
      )
      .subscribe();

    return () => {
      contractSubscription.unsubscribe();
    };
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
