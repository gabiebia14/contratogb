
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useContractGemini } from '@/hooks/useContractGemini';

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
  const { processContract } = useContractGemini();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        toast.success('Arquivo selecionado: ' + file.name);
      } else {
        toast.error('Por favor, selecione um arquivo PDF ou DOCX');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    try {
      setLoading(true);

      let prompt = input;
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileContent = e.target?.result as string;
          prompt = `${fileContent}\n\n${input}`;
          
          try {
            const response = await processContract(prompt);
            
            setMessages(prev => [
              ...prev,
              { role: 'user', content: `Arquivo: ${selectedFile.name}\n${input}` },
              { role: 'assistant', content: response }
            ]);
            
            setSelectedFile(null);
            setInput('');
          } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            toast.error('Erro ao processar arquivo');
          }
        };
        
        if (selectedFile.type === 'application/pdf') {
          reader.readAsDataURL(selectedFile);
        } else {
          reader.readAsText(selectedFile);
        }
      } else {
        const response = await processContract(prompt);
        setMessages(prev => [
          ...prev,
          { role: 'user', content: input },
          { role: 'assistant', content: response }
        ]);
        setInput('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="min-h-[600px] flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Assistente ContractPro</h1>
          <p className="text-sm text-gray-500">
            Tire suas dúvidas sobre contratos e documentos
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </label>
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
      </Card>
    </div>
  );
}
