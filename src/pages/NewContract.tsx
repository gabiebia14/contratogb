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
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileCheck } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  templateId: z.string({
    required_error: "Por favor selecione um modelo de contrato.",
  }),
  documentId: z.string().optional(),
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

            <div className="space-y-4">
              <FormLabel>Documentos Disponíveis</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedDocuments.map((doc) => (
                  <Card 
                    key={doc.id}
                    className={`cursor-pointer transition-all ${
                      form.watch("documentId") === doc.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => form.setValue("documentId", doc.id)}
                  >
                    <CardContent className="flex items-start p-4 space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {form.watch("documentId") === doc.id ? (
                          <FileCheck className="h-6 w-6 text-primary" />
                        ) : (
                          <FileText className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-500">
                          Processado em: {new Date(doc.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Gerar Contrato</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}