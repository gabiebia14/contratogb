
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Upload, FileText, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('O arquivo deve ter menos de 5MB');
          return;
        }
        setSelectedFile(file);
        toast.success('Arquivo selecionado: ' + file.name);
      } else {
        toast.error('Por favor, selecione um arquivo PDF ou DOCX');
      }
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    try {
      setLoading(true);

      if (selectedFile) {
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: `Arquivo enviado: ${selectedFile.name}` 
        }]);
      }

      if (input.trim()) {
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: input.trim() 
        }]);
      }

      let formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('content', input.trim());

      const { data, error } = await supabase.functions.invoke('process-contract', {
        body: formData
      });

      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }

      setInput('');
      setSelectedFile(null);

      if (data) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.text || 'Não foi possível processar a resposta.'
        }]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const ChatInterface = () => (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Sheet>
          <SheetTrigger asChild>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center min-h-[200px] space-y-4">
              <FileText className="w-12 h-12 text-primary" />
              <h2 className="text-xl font-bold text-center">Geração de Template de Contrato</h2>
              <p className="text-sm text-gray-500 text-center">
                Use IA para gerar templates de contratos personalizados
              </p>
            </Card>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[600px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Assistente de Geração de Contratos</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
              <ChatInterface />
              <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUploadClick}
                  className="cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>

        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center min-h-[200px] space-y-4"
          onClick={() => toast.info('Funcionalidade em desenvolvimento')}
        >
          <GitCompare className="w-12 h-12 text-primary" />
          <h2 className="text-xl font-bold text-center">Comparação de Contratos</h2>
          <p className="text-sm text-gray-500 text-center">
            Compare diferentes versões de contratos e identifique diferenças
          </p>
        </Card>
      </div>
    </div>
  );
}
