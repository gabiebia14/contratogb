import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

export default function AnalisarContrato() {
  const [contrato, setContrato] = useState('');
  const [análise, setAnálise] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return;

    const file = files[0];
    setProgress(0);
    setLoading(true);
    setAnálise('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 2;
        if (progress <= 90) {
          setProgress(progress);
        }
      }, 1000);

      const { data, error } = await supabase.functions.invoke('analyze-with-qwen', {
        body: formData,
      });

      clearInterval(intervalId);
      setProgress(100);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message);
      }
      
      if (!data?.análise) {
        throw new Error('Não foi possível gerar a análise do contrato');
      }

      setAnálise(data.análise);
      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao analisar arquivo:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao analisar o arquivo');
      setAnálise('');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }

  const analisarContrato = async () => {
    if (!contrato.trim()) {
      toast.error('Por favor, insira o texto do contrato');
      return;
    }

    setProgress(0);
    setLoading(true);
    setAnálise('');

    try {
      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 2;
        if (progress <= 90) {
          setProgress(progress);
        }
      }, 1000);

      const { data, error } = await supabase.functions.invoke('analyze-with-qwen', {
        body: { texto: contrato }
      });

      clearInterval(intervalId);
      setProgress(100);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message);
      }
      
      if (!data?.análise) {
        throw new Error('Não foi possível gerar a análise do contrato');
      }

      setAnálise(data.análise);
      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao analisar contrato:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao analisar o contrato');
      setAnálise('');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-2xl font-bold">Analisar Contrato</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Contrato</h3>
          
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ease-in-out",
                isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? 'Solte o arquivo aqui...'
                    : 'Arraste um arquivo ou clique para fazer upload'}
                </p>
                <p className="text-xs text-gray-500">
                  Suporta: TXT e PDF (máx. 10MB)
                </p>
                {acceptedFiles[0] && (
                  <p className="text-sm text-green-600">
                    Arquivo selecionado: {acceptedFiles[0].name}
                  </p>
                )}
              </div>
            </div>
            
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

            {progress > 0 && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Processando... {progress}%
                </p>
              </div>
            )}

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
          <div className="min-h-[400px] p-4 border rounded-md bg-muted/50 overflow-y-auto">
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
