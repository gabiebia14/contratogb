
import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import mammoth from 'mammoth';
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
import { Loader2, Upload, Save, X, FileText, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContractTemplateEditorProps {
  onClose: () => void;
  onSave: (name: string, content: string, variables: Record<string, string>) => void;
  initialContent?: string;
  initialName?: string;
  initialVariables?: Record<string, string>;
}

const ContractTemplateEditor = ({
  onClose,
  onSave,
  initialContent = '',
  initialName = '',
  initialVariables = {}
}: ContractTemplateEditorProps) => {
  const [fileName, setFileName] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>(initialName);
  const [variables, setVariables] = useState<Record<string, string>>(initialVariables);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [rawContent, setRawContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const analyzeContractWithGemini = async (content: string) => {
    try {
      setIsAnalyzing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado para analisar o contrato');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-contract', {
        body: { content }
      });

      if (error) throw error;

      if (data?.text && data?.variables) {
        editor?.commands.setContent(data.text);
        setVariables(data.variables);
        toast.success('Análise concluída com sucesso!');
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao analisar contrato:', error);
      toast.error('Erro ao analisar o contrato. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setShowAnalysisDialog(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
    
    try {
      if (file.type === 'application/pdf') {
        toast.error('Suporte a PDF em desenvolvimento');
        return;
      }

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const content = result.value;
        
        setRawContent(content);
        editor?.commands.setContent(content);
        
        setShowAnalysisDialog(true);
      }
    } catch (error) {
      console.error('Erro ao importar documento:', error);
      toast.error('Erro ao importar documento');
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Por favor, insira um nome para o modelo');
      return;
    }

    try {
      setIsSaving(true);
      const content = editor?.getHTML() || '';
      await onSave(templateName, content, variables);
      toast.success('Modelo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      toast.error('Erro ao salvar o modelo');
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = useCallback((variableName: string, label: string) => {
    editor?.commands.insertContent(`{{${variableName}}}`);
  }, [editor]);

  const categorizeVariables = useCallback(() => {
    const categories = {
      locador: [] as [string, string][],
      locatario: [] as [string, string][],
      fiador: [] as [string, string][],
      outros: [] as [string, string][]
    };

    Object.entries(variables).forEach(([key, value]) => {
      if (key.startsWith('locador_')) {
        categories.locador.push([key, value]);
      } else if (key.startsWith('locatari')) {
        categories.locatario.push([key, value]);
      } else if (key.startsWith('fiador')) {
        categories.fiador.push([key, value]);
      } else {
        categories.outros.push([key, value]);
      }
    });

    return categories;
  }, [variables]);

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-white p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Editor de Modelo</h2>
          {fileName && (
            <p className="text-sm text-gray-500 mt-1">
              Arquivo: {fileName}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Fechar
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Nome do modelo"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="mb-2"
          />
          <div className="flex gap-2">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".docx,.pdf"
              className="hidden"
              id="template-file"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="template-file">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Documento
                      </span>
                    </Button>
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suporta arquivos .docx</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="space-y-2">
            {Object.entries(categorizeVariables()).map(([category, vars]) => 
              vars.length > 0 && (
                <div key={category} className="space-y-1">
                  <h3 className="text-sm font-semibold capitalize">{category}</h3>
                  <div className="flex flex-wrap gap-1">
                    {vars.map(([key, label]) => (
                      <TooltipProvider key={key}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(key, label)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clique para inserir: {`{{${key}}}`}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto border rounded-lg bg-white">
        <EditorContent editor={editor} className="min-h-[400px]" />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Modelo
            </>
          )}
        </Button>
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
            <AlertDialogAction
              onClick={() => analyzeContractWithGemini(rawContent)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Sim, analisar agora
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ContractTemplateEditor;
