
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useContractTemplates } from '@/hooks/useContractTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ContractTemplates() {
  const [showNewForm, setShowNewForm] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'Geral'
  });
  const { templates, loading, addTemplate } = useContractTemplates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await addTemplate(
        newTemplate.name,
        newTemplate.content,
        newTemplate.category
      );
      
      // Reset form
      setNewTemplate({
        name: '',
        content: '',
        category: 'Geral'
      });
      setShowNewForm(false);
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Erro ao adicionar modelo de contrato');
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
                placeholder="Cole o texto do contrato aqui..."
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Adicionar Modelo'}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-gray-500">Categoria: {template.category}</p>
            <p className="text-sm text-gray-500">
              Última modificação: {new Date(template.updated_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
