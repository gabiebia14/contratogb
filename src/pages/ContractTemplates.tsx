
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContractTemplates() {
  const [showNewForm, setShowNewForm] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'Geral'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [rawContent, setRawContent] = useState<string>('');
  const [processedContent, setProcessedContent] = useState<{
    text: string;
    variables: Record<string, string>;
  } | null>(null);
  const { templates, loading, addTemplate } = useContractTemplates();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    const fileType = file.type;
    if (!fileType.includes('pdf') && !fileType.includes('word') && !fileType.includes('openxmlformats')) {
      toast.error('Apenas arquivos PDF ou Word são permitidos');
      return;
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB');
      return;
    }

    setSelectedFile(file);

    // Atualizar o nome do template com o nome do arquivo se estiver vazio
    if (!newTemplate.name) {
      setNewTemplate(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, '') // Remove a extensão
      }));
    }

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove o prefixo data:application/...
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileContent: base64Data
        })
      });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      if (data?.content) {
        setRawContent(data.content);
        
        // Analyze the content with Gemini
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-contract', {
          body: { content: data.content }
        });

        if (analysisError) throw analysisError;

        if (analysisData) {
          setProcessedContent(analysisData);
          setNewTemplate(prev => ({
            ...prev,
            content: analysisData.text
          }));
        }
        
        setShowAnalysisDialog(true);
      } else {
        throw new Error('Nenhum conteúdo processado');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Erro ao processar arquivo: ' + (error as Error).message);
    }
  };

  const analyzeContractWithGemini = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: { content: rawContent }
      });

      if (error) throw error;

      if (data) {
        setProcessedContent(data);
        setNewTemplate(prev => ({
          ...prev,
          content: data.text
        }));
        toast.success('Parâmetros adicionados com sucesso!');
      } else {
        throw new Error('Nenhum conteúdo processado');
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
      toast.error('Erro ao analisar contrato: ' + (error as Error).message);
    } finally {
      setShowAnalysisDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTemplate.name) {
      toast.error('Digite um nome para o modelo');
      return;
    }

    if (!selectedFile && !newTemplate.content) {
      toast.error('Adicione um arquivo ou digite o conteúdo do modelo');
      return;
    }

    try {
      await addTemplate(
        newTemplate.name,
        newTemplate.content || rawContent,
        processedContent?.variables || {}
      );
      
      // Reset form
      setNewTemplate({
        name: '',
        content: '',
        category: 'Geral'
      });
      setSelectedFile(null);
      setShowNewForm(false);
      setRawContent('');
      setProcessedContent(null);
      
      toast.success('Modelo de contrato adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Erro ao adicionar modelo de contrato: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modelos de Contrato</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {showNewForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Ex: Contrato de Locação"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Input
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                placeholder="Ex: Geral, Locação, Compra e Venda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Upload de Arquivo</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {selectedFile && (
                  <div className="text-sm text-gray-500">
                    {selectedFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suporta arquivos Word (.doc, .docx) e PDF. Máximo 10MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Conteúdo do Modelo {processedContent ? '(processado pelo Gemini)' : '(opcional se arquivo for enviado)'}
              </label>
              <textarea
                value={processedContent?.text || newTemplate.content || rawContent}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="w-full min-h-[200px] p-2 border rounded"
                placeholder="Cole o texto do contrato aqui..."
              />
            </div>

            {processedContent?.variables && Object.keys(processedContent.variables).length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Variáveis Identificadas:</label>
                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                  {Object.entries(processedContent.variables).map(([key, description]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600">{`{${key}}`}</span>
                      <span className="text-gray-600 ml-2">{description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Processando...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Modelo
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500">Categoria: {template.category}</p>
                <p className="text-sm text-gray-500">
                  Última modificação: {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Conteúdo do Modelo:</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm">
                  {template.content}
                </div>

                {template.template_variables && Object.keys(template.template_variables).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Variáveis do Modelo:</h4>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                      {Object.entries(template.template_variables).map(([key, description]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono text-blue-600">{`{${key}}`}</span>
                          <span className="text-gray-600 ml-2">{description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Análise Automática</AlertDialogTitle>
            <AlertDialogDescription>
              Gostaria de adicionar automaticamente os parâmetros nas cláusulas deste contrato?
              O sistema irá analisar o texto e sugerir variáveis para campos como nomes,
              documentos, endereços e valores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter como está</AlertDialogCancel>
            <AlertDialogAction onClick={analyzeContractWithGemini}>
              Sim, adicionar parâmetros
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
