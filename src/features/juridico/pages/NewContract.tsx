
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useContractTemplates } from "@/features/juridico/hooks/useContractTemplates";
import { useProcessedDocuments } from "@/features/juridico/hooks/useProcessedDocuments";
import { useContractGeneration } from "@/features/juridico/hooks/useContractGeneration";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  templateId: z.string().min(1, "Selecione um template"),
  documentId: z.string().min(1, "Selecione um documento"),
  documentRole: z.string().min(1, "Selecione o papel do documento"),
});

export default function NewContract() {
  const navigate = useNavigate();
  const { templates, isLoading: templatesLoading } = useContractTemplates();
  const { documents, isLoading: documentsLoading } = useProcessedDocuments();
  const { generateContract } = useContractGeneration();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      templateId: "",
      documentId: "",
      documentRole: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const contract = await generateContract(
        values.templateId,
        [{ role: values.documentRole, documentId: values.documentId }],
        values.title
      );

      toast.success("Contrato criado com sucesso!", {
        description: (
          <div className="flex flex-col gap-2">
            <p>O contrato foi gerado e está pronto para revisão.</p>
            <button 
              onClick={() => navigate(`/juridico/contracts/${contract.id}`)}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Visualizar Contrato
            </button>
          </div>
        )
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate(`/juridico/contracts/${contract.id}`);
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      toast.error("Erro ao gerar contrato", {
        description: "Ocorreu um erro ao gerar o contrato. Por favor, tente novamente."
      });
    }
  }

  if (templatesLoading || documentsLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Novo Contrato</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título do contrato" {...field} />
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
                <FormLabel>Template</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Papel no Contrato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="locador">Locador</SelectItem>
                    <SelectItem value="locadora">Locadora</SelectItem>
                    <SelectItem value="locatario">Locatário</SelectItem>
                    <SelectItem value="locataria">Locatária</SelectItem>
                    <SelectItem value="fiador">Fiador</SelectItem>
                    <SelectItem value="fiadora">Fiadora</SelectItem>
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
                      <SelectValue placeholder="Selecione um documento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documents?.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.file_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Gerar Contrato</Button>
        </form>
      </Form>
    </div>
  );
}
