
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import FileUploadArea from '@/components/ocr/FileUploadArea';

export default function AnalisarContrato() {
  const [contrato, setContrato] = useState('');
  const [análise, setAnálise] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('analyze-with-qwen', {
        body: formData,
      });

      if (error) throw error;
      
      setAnálise(data.análise);
      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao analisar arquivo:', error);
      toast.error('Erro ao analisar o arquivo: ' + (error as Error).message);
    }
  };

  const analisarContrato = async () => {
    if (!contrato.trim()) {
      toast.error('Por favor, insira o texto do contrato');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-with-qwen', {
        body: { texto: contrato }
      });

      if (error) throw error;
      
      setAnálise(data.análise);
      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao analisar contrato:', error);
      toast.error('Erro ao analisar o contrato: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-2xl font-bold">Analisar Contrato</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Contrato</h3>
          
          <div className="space-y-4">
            <FileUploadArea onFilesSelected={handleFileUpload} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou cole o texto
                </span>
              </div>
            </div>

            <Textarea
              placeholder="Cole o texto do contrato aqui..."
              className="min-h-[300px] font-mono text-sm"
              value={contrato}
              onChange={(e) => setContrato(e.target.value)}
            />
            <Button 
              onClick={analisarContrato}
              disabled={loading || !contrato.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Texto do Contrato'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Análise do Contrato</h3>
          <div className="min-h-[400px] p-4 border rounded-md bg-muted/50">
            {análise ? (
              <div className="whitespace-pre-wrap">{análise}</div>
            ) : (
              <p className="text-muted-foreground text-center mt-[180px]">
                A análise do contrato aparecerá aqui...
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
