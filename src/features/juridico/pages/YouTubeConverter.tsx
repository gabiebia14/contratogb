
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Loader2 } from 'lucide-react';

export default function YouTubeConverter() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; title?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloadInfo(null);
    
    if (!url) {
      toast.error('Por favor, insira uma URL do YouTube');
      return;
    }

    setIsLoading(true);
    toast.info('Iniciando processo de conversão...');

    try {
      const { data, error } = await supabase.functions.invoke('youtube-to-mp3', {
        body: { url }
      });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message);
      }

      if (!data?.downloadUrl) {
        console.error('Resposta sem URL de download:', data);
        throw new Error('URL de download não encontrada na resposta');
      }

      setDownloadInfo({ url: data.downloadUrl });
      toast.success('Conversão concluída!');
    } catch (error) {
      console.error('Erro detalhado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao processar o vídeo: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadInfo?.url) {
      window.location.href = downloadInfo.url;
      toast.success('Download iniciado!');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Converter YouTube para MP3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="youtube-url" className="text-sm font-medium">
                URL do YouTube
              </label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Converter para MP3'
              )}
            </Button>
          </form>

          {downloadInfo && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="text-center space-y-4">
                <h3 className="font-medium text-lg">Arquivo pronto para download!</h3>
                <Button 
                  onClick={handleDownload}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2" />
                  Baixar MP3
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
