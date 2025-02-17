
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractGeneration } from '@/hooks/useContractGeneration';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function GenerateContract() {
  const navigate = useNavigate();
  const { templates, isLoading: templatesLoading } = useContractTemplates();
  const { loading, generateContract } = useContractGeneration();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template?.content) {
      try {
        setShowPreview(true);
        setPreviewContent(template.content);
      } catch (error) {
        console.error('Erro ao processar template:', error);
        toast.error('Erro ao processar template');
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedDocument) {
      toast.error('Selecione um template e documento');
      return;
    }

    try {
      const contract = await generateContract(selectedTemplate, selectedDocument, 'Novo Contrato');
      toast.success('Contrato gerado com sucesso!');
      navigate(`/juridico/contracts/${contract.id}`);
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      toast.error('Erro ao gerar contrato');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerar Novo Contrato</h1>
        <Button onClick={() => navigate('/juridico/contracts')} variant="outline">
          Voltar para Contratos
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Templates Disponíveis</CardTitle>
            <CardDescription>Selecione um template para começar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templatesLoading ? (
              <p>Carregando templates...</p>
            ) : (
              templates?.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.category}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="w-full"
              disabled={!selectedTemplate}
              variant="outline"
            >
              Visualizar Template
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90vw] sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Preview do Template</SheetTitle>
              <SheetDescription>
                Visualize como o template será preenchido
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 prose prose-sm max-w-none">
              {previewContent ? (
                <div className="whitespace-pre-wrap">{previewContent}</div>
              ) : (
                <p>Selecione um template para visualizar</p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
            <CardDescription>
              Configure os detalhes do contrato a ser gerado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Documentos Processados</Label>
              {/* Aqui você pode adicionar a lista de documentos processados */}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedTemplate || !selectedDocument || loading}
              className="w-full"
            >
              {loading ? 'Gerando Contrato...' : 'Gerar Contrato'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
