import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Handlebars from 'handlebars';

export default function ContractTemplates() {
  const [showNewForm, setShowNewForm] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'Geral'
  });
  const { templates, loading, addTemplate } = useContractTemplates();

  const processTemplateWithHandlebars = (content: string) => {
    try {
      const template = Handlebars.compile(content);
      
      const matches = content.match(/{{([^}]+)}}/g);
      const variables: Record<string, string> = {};
      
      if (matches) {
        matches.forEach(match => {
          const key = match.replace(/[{}]/g, '').trim();
          if (!(key in variables)) {
            variables[key] = `Campo para ${key.replace(/_/g, ' ')}`;
          }
        });
      }

      return {
        processedContent: content,
        variables
      };
    } catch (error) {
      console.error('Erro ao processar template:', error);
      toast.error('Erro ao processar template: ' + (error as Error).message);
      return null;
    }
  };

  const previewTemplate = (content: string, variables: Record<string, any>) => {
    try {
      const template = Handlebars.compile(content);
      const sampleData: Record<string, string> = {};
      
      Object.keys(variables).forEach(key => {
        sampleData[key] = `[Exemplo ${key}]`;
      });
      
      return template(sampleData);
    } catch (error) {
      console.error('Error previewing template:', error);
      return content;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTemplate.name) {
      toast.error('Digite um nome para o modelo');
      return;
    }

    if (!newTemplate.content) {
      toast.error('Digite o conteúdo do modelo');
      return;
    }

    try {
      const processed = processTemplateWithHandlebars(newTemplate.content);
      if (!processed) {
        toast.error('Template inválido');
        return;
      }

      await addTemplate({
        name: newTemplate.name,
        content: processed.processedContent,
        variables: processed.variables
      });
      
      setNewTemplate({
        name: '',
        content: '',
        category: 'Geral'
      });
      setShowNewForm(false);
      
      toast.success('Modelo de contrato adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Erro ao adicionar modelo de contrato: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modelos de Contrato</h1>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {showNewForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Ex: Contrato de Locação"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Input
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                placeholder="Ex: Geral, Locação, Compra e Venda"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Conteúdo do Modelo</label>
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                className="w-full min-h-[200px] p-2 border rounded"
                placeholder="Cole o texto do contrato aqui, usando {{variavel}} para campos dinâmicos..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use chaves duplas para campos dinâmicos.
                Exemplos: {"{{locador_nome}}, {{locatario_cpf}}"}
              </p>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Processando...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Modelo
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{template.name}</h3>
                <p className="text-sm text-gray-500">Categoria: {template.category}</p>
                <p className="text-sm text-gray-500">
                  Última modificação: {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Preview do Modelo:</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm">
                  {template.template_variables 
                    ? previewTemplate(template.content, template.template_variables as Record<string, string>)
                    : template.content}
                </div>

                {template.template_variables && Object.keys(template.template_variables).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Variáveis do Modelo:</h4>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                      {Object.entries(template.template_variables).map(([key, description]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono text-blue-600">{`{{${key}}}`}</span>
                          <span className="text-gray-600 ml-2">{description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
