
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
  const { templates } = useContractTemplates();
  const { processedDocuments } = useOCR();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      templateId: "",
      documentId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Contrato criado com sucesso!",
      description: "O contrato foi gerado e está pronto para revisão.",
    });
  }

  const getValidFields = (extractedData: any) => {
    if (!extractedData || typeof extractedData !== 'object') return [];
    
    try {
      const jsonData = typeof extractedData === 'string' ? JSON.parse(extractedData) : extractedData;
      return Object.entries(jsonData)
        .filter(([_, value]) => value !== null && value !== '')
        .map(([key, value]) => ({
          field: key,
          value: String(value)
        }));
    } catch (error) {
      console.error('Error parsing data:', error);
      return [];
    }
  };

  // Filter documents using the same logic as ProcessedHistory
  const validDocuments = processedDocuments.filter((doc) => {
    const fields = getValidFields(doc.extracted_data);
    return fields.some(({ field, value }) => 
      (field === 'nome_completo' || field === 'nome') && value
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Novo Contrato</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Contrato de Prestação de Serviços" {...field} />
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
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={String(template.id)}>
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
                      {validDocuments.map((doc) => {
                        const fields = getValidFields(doc.extracted_data);
                        const nameField = fields.find(f => 
                          f.field === 'nome_completo' || f.field === 'nome'
                        );
                        return (
                          <SelectItem key={doc.id} value={String(doc.id)}>
                            {nameField?.value || 'Documento sem nome'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Gerar Contrato</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
