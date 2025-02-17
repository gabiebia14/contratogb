
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ContractViewer() {
  const { id } = useParams();
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
          .single();

        if (error) throw error;
        setContract(data);
      } catch (err) {
        console.error('Erro ao buscar contrato:', err);
        setError('Erro ao carregar o contrato. Por favor, tente novamente mais tarde.');
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
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Contrato não encontrado</div>
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
