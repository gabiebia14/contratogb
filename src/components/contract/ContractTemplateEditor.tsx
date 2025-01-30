import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import mammoth from 'mammoth';

interface ContractTemplateEditorProps {
  onClose: () => void;
  onSave: (name: string, content: string) => void;
  initialContent?: string;
  initialName?: string;
}

const ContractTemplateEditor = ({ 
  onClose, 
  onSave,
  initialContent = '',
  initialName = '' 
}: ContractTemplateEditorProps) => {
  const [fileName, setFileName] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>(initialName);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setTemplateName(file.name.replace(/\.[^/.]+$/, '')); // Remove extensão do arquivo
    
    try {
      if (file.type === 'application/pdf') {
        toast.error('Suporte a PDF em desenvolvimento');
        return;
      }

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editor?.commands.setContent(result.value);
        toast.success('Documento importado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao importar documento:', error);
      toast.error('Erro ao importar documento');
    }
  };

  const insertDynamicField = (fieldName: string) => {
    editor?.commands.insertContent(`{{${fieldName}}}`);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error('Por favor, insira um nome para o modelo');
      return;
    }

    const content = editor?.getHTML() || '';
    onSave(templateName, content);
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-white p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Editor de Modelo</h2>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
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
            <label htmlFor="template-file">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Importar Documento</span>
              </Button>
            </label>
            {fileName && <p className="mt-2 text-sm text-gray-500">{fileName}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => insertDynamicField('nome')}>
            Inserir Nome
          </Button>
          <Button variant="outline" onClick={() => insertDynamicField('cpf')}>
            Inserir CPF
          </Button>
          <Button variant="outline" onClick={() => insertDynamicField('rg')}>
            Inserir RG
          </Button>
          <Button variant="outline" onClick={() => insertDynamicField('endereco')}>
            Inserir Endereço
          </Button>
          <Button variant="outline" onClick={() => insertDynamicField('profissao')}>
            Inserir Profissão
          </Button>
          <Button variant="outline" onClick={() => insertDynamicField('telefone')}>
            Inserir Telefone
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto border rounded-lg p-4">
        <EditorContent editor={editor} className="min-h-full" />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar Modelo</Button>
      </div>
    </Card>
  );
};

export default ContractTemplateEditor;