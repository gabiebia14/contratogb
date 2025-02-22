
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
      // TODO: Implementar a lógica de conversão do YouTube para MP3
      // Por enquanto, vamos apenas simular o processo
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Áudio baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar o vídeo');
      console.error('Erro:', error);
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
