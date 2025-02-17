import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { useOCR } from "@/hooks/useOCR";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useContractGeneration } from "@/hooks/useContractGeneration";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  templateId: z.string({
    required_error: "Por favor selecione um modelo de contrato.",
  }),
  documentId: z.string({
    required_error: "Por favor selecione um documento.",
  }),
});

export default function NewContract() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, loading: templatesLoading } = useContractTemplates();
  const { processedDocuments, loading: documentsLoading } = useOCR();
  const { generateContract, loading: generatingContract } = useContractGeneration();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      templateId: "",
      documentId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const contract = await generateContract(
        values.templateId,
        [{ role: 'locador', documentId: values.documentId }],
        values.title
      );

      toast({
        title: "Contrato criado com sucesso!",
        description: (
          <div className="flex flex-col gap-2">
            <p>O contrato foi gerado e está pronto para revisão.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/juridico/contracts/${contract.id}`)}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Visualizar Contrato
              </button>
            </div>
          </div>
        ),
        duration: 5000,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate(`/juridico/contracts/${contract.id}`);
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      toast({
        title: "Erro ao gerar contrato",
        description: "Ocorreu um erro ao gerar o contrato. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "Data não disponível";
    }
  };

  const getDocumentDetails = (doc: any) => {
    try {
      const data = typeof doc.extracted_data === 'string' 
        ? JSON.parse(doc.extracted_data) 
        : doc.extracted_data;

      const role = doc.document_role || '';
      const baseField = role.includes('a') ? role : role.replace(/r$/, 'r');

      const nome = data[`${baseField}_nome`] || data[`${baseField}_nome_completo`] || data.nome_completo;
      const cpf = data[`${baseField}_cpf`] || data.cpf;
      const rg = data[`${baseField}_rg`] || data.rg;

      return {
        nome: nome || 'Nome não encontrado',
        cpf: cpf || 'CPF não encontrado',
        rg: rg || 'RG não encontrado',
        data: formatDate(doc.processed_at || doc.created_at)
      };
    } catch (error) {
      console.error('Erro ao processar detalhes do documento:', error);
      return {
        nome: 'Erro ao carregar dados',
        cpf: '-',
        rg: '-',
        data: '-'
      };
    }
  };

  const validDocuments = processedDocuments
    .filter(doc => {
      if (!doc.extracted_data) return false;
      try {
        const details = getDocumentDetails(doc);
        return details.nome !== 'Nome não encontrado' && 
               details.nome !== 'Erro ao carregar dados' &&
               doc.status === 'completed';
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.processed_at || a.created_at).getTime();
      const dateB = new Date(b.processed_at || b.created_at).getTime();
      return dateB - dateA;
    });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Contrato</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para gerar um novo contrato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Contrato de Locação - João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de Contrato</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo de contrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templatesLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Nenhum modelo disponível
                        </div>
                      ) : (
                        templates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um documento processado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {documentsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : validDocuments.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Nenhum documento processado disponível.
                          <br />
                          Processe um documento na seção "Documentos" primeiro.
                        </div>
                      ) : (
                        validDocuments.map((doc) => {
                          const details = getDocumentDetails(doc);
                          return (
                            <SelectItem key={doc.id} value={doc.id}>
                              <div className="flex flex-col gap-1">
                                <div className="font-medium">{details.nome}</div>
                                <div className="text-xs text-gray-500">
                                  CPF: {details.cpf} | RG: {details.rg}
                                  <br />
                                  Processado em: {details.data}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={templatesLoading || documentsLoading || generatingContract}
              >
                {templatesLoading || documentsLoading || generatingContract ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {generatingContract ? 'Gerando contrato...' : 'Carregando...'}
                  </>
                ) : (
                  'Gerar Contrato'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
