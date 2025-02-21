import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContractTemplates } from '@/features/juridico/hooks/useContractTemplates';
import { useProcessedDocuments } from '@/features/juridico/hooks/useProcessedDocuments';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useContractGeneration } from '@/features/juridico/hooks/useContractGeneration';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, ScrollText } from 'lucide-react';
import ExtractedDataDisplay from '@/components/ocr/ExtractedDataDisplay';
import { ExtractedField } from '@/types/ocr';

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

  const getDocumentData = (documentId: string): ExtractedField[] => {
    const document = documents?.find(doc => doc.id === documentId);
    if (!document?.extracted_data) return [];

    let extractedData: Record<string, any>;
    try {
      extractedData = typeof document.extracted_data === 'string'
        ? JSON.parse(document.extracted_data)
        : document.extracted_data;
    } catch (error) {
      console.error('Erro ao processar dados extraídos:', error);
      return [];
    }

    return Object.entries(extractedData).map(([field, value]) => ({
      field,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      confidence: 1
    }));
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
      const contract = await generateContract(selectedTemplate, contractParties, 'Novo Contrato');
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
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerar Novo Contrato</h1>
        <Button onClick={() => navigate('/juridico/contracts')} variant="outline">
          Voltar para Contratos
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-xl">Templates Disponíveis</CardTitle>
            <CardDescription>Selecione um template para começar</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesLoading ? (
                <div className="col-span-full flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Carregando templates...</p>
                </div>
              ) : (
                templates?.map((template) => (
                  <div
                    key={template.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <ScrollText className="h-5 w-5 text-primary/70 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-medium leading-none">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  className="w-full max-w-md mx-auto block"
                  disabled={!selectedTemplate}
                  variant="secondary"
                >
                  <ScrollText className="mr-2 h-4 w-4" />
                  Visualizar Template Selecionado
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
                    <p className="text-muted-foreground">Selecione um template para visualizar</p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-xl">Dados do Contrato</CardTitle>
            <CardDescription>
              Adicione as partes do contrato e seus respectivos documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {documentsLoading ? (
              <p className="text-muted-foreground">Carregando documentos...</p>
            ) : (
              <>
                {contractParties.map((party, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex gap-4 items-start">
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
                            {documents.map((doc) => {
                              let displayName = doc.file_name;
                              try {
                                const extractedData = typeof doc.extracted_data === 'string' 
                                  ? JSON.parse(doc.extracted_data)
                                  : doc.extracted_data;
                                
                                const name = extractedData.nome_completo || 
                                           extractedData.locador_nome ||
                                           extractedData.locatario_nome ||
                                           extractedData.locataria_nome ||
                                           extractedData.fiador_nome;
                                
                                if (name && typeof name === 'string') {
                                  displayName = name;
                                }
                              } catch (error) {
                                console.error('Erro ao processar dados extraídos:', error);
                              }

                              return (
                                <SelectItem key={doc.id} value={doc.id}>
                                  {displayName}
                                </SelectItem>
                              );
                            })}
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

                    {party.documentId && (
                      <div className="pl-4 border-l-2 border-primary/20">
                        <ExtractedDataDisplay data={getDocumentData(party.documentId)} />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex flex-col gap-4 items-center pt-4">
                  <Button
                    onClick={handleAddParty}
                    variant="outline"
                    className="w-full max-w-md"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Parte
                  </Button>

                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedTemplate || contractParties.length === 0 || loading}
                    className="w-full max-w-md"
                  >
                    {loading ? 'Gerando Contrato...' : 'Gerar Contrato'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
