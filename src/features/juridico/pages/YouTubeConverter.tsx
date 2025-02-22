
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function YouTubeConverter() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Por favor, insira uma URL do YouTube');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-to-mp3', {
        body: { url }
      });

      if (error) throw error;

      // Criar um Blob a partir dos dados recebidos
      const blob = new Blob([data], { type: 'audio/mpeg' });
      
      // Criar uma URL para o Blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Criar um elemento <a> temporário para download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'audio.mp3'; // Nome do arquivo para download
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Áudio baixado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar o vídeo: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Converter YouTube para MP3</CardTitle>
        </CardHeader>
        <CardContent>
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
              {isLoading ? 'Processando...' : 'Baixar MP3'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
