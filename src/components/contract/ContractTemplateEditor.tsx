import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import mammoth from 'mammoth';

interface ContractTemplateEditorProps {
  onClose: () => void;
}

const ContractTemplateEditor = ({ onClose }: ContractTemplateEditorProps) => {
  const [fileName, setFileName] = useState<string>('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
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
    
    try {
      if (file.type === 'application/pdf') {
        // Para PDFs, você precisaria de uma biblioteca específica para conversão
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
    const content = editor?.getHTML();
    // Aqui você implementaria a lógica para salvar o template
    console.log('Conteúdo do template:', content);
    toast.success('Modelo salvo com sucesso!');
    onClose();
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-white p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Editor de Modelo</h2>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div>
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => insertDynamicField('nome')}
          >
            Inserir Nome
          </Button>
          <Button
            variant="outline"
            onClick={() => insertDynamicField('cpf')}
          >
            Inserir CPF
          </Button>
          <Button
            variant="outline"
            onClick={() => insertDynamicField('rg')}
          >
            Inserir RG
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