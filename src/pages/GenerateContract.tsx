
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { useProcessedDocuments } from '@/hooks/useProcessedDocuments';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractGeneration } from '@/hooks/useContractGeneration';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface ContractParty {
  role: string;
  documentId: string;
}

export default function GenerateContract() {
  const navigate = useNavigate();
  const { templates, isLoading: templatesLoading } = useContractTemplates();
  const { documents, isLoading: documentsLoading } = useProcessedDocuments();
  const { loading, generateContract } = useContractGeneration();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [contractParties, setContractParties] = useState<ContractParty[]>([]);
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

  const handleAddParty = () => {
    setContractParties([...contractParties, { role: '', documentId: '' }]);
  };

  const handleRemoveParty = (index: number) => {
    setContractParties(contractParties.filter((_, i) => i !== index));
  };

  const handlePartyChange = (index: number, field: 'role' | 'documentId', value: string) => {
    const newParties = [...contractParties];
    newParties[index] = { ...newParties[index], [field]: value };
    setContractParties(newParties);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || contractParties.length === 0) {
      toast.error('Selecione um template e adicione as partes do contrato');
      return;
    }

    if (contractParties.some(party => !party.role || !party.documentId)) {
      toast.error('Preencha todas as informações das partes do contrato');
      return;
    }

    try {
      const mainDocumentId = contractParties[0].documentId; // Usando o primeiro documento como principal
      const contract = await generateContract(selectedTemplate, mainDocumentId, 'Novo Contrato');
      toast.success('Contrato gerado com sucesso!');
      navigate(`/juridico/contracts/${contract.id}`);
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      toast.error('Erro ao gerar contrato');
    }
  };

  const availableRoles = [
    { value: 'locador', label: 'Locador' },
    { value: 'locadora', label: 'Locadora' },
    { value: 'locatario', label: 'Locatário' },
    { value: 'locataria', label: 'Locatária' },
    { value: 'fiador', label: 'Fiador' },
    { value: 'fiadora', label: 'Fiadora' },
  ];

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

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
            <CardDescription>
              Adicione as partes do contrato e seus respectivos documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {documentsLoading ? (
              <p>Carregando documentos...</p>
            ) : (
              <>
                {contractParties.map((party, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <Label>Parte do Contrato</Label>
                      <Select
                        value={party.role}
                        onValueChange={(value) => handlePartyChange(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Label>Documento</Label>
                      <Select
                        value={party.documentId}
                        onValueChange={(value) => handlePartyChange(index, 'documentId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o documento" />
                        </SelectTrigger>
                        <SelectContent>
                          {documents.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.file_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => handleRemoveParty(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  onClick={handleAddParty}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Parte
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedTemplate || contractParties.length === 0 || loading}
                  className="w-full"
                >
                  {loading ? 'Gerando Contrato...' : 'Gerar Contrato'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
