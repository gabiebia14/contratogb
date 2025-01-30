import React, { useState } from 'react';
import { FileText, Download, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ContractTemplateEditor from '@/components/contract/ContractTemplateEditor';

interface Template {
  id: number;
  name: string;
  category: string;
  lastModified: string;
  downloads: number;
  content: string;
}

const ContractTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'Contrato de Prestação de Serviços',
      category: 'Serviços',
      lastModified: '15/03/2024',
      downloads: 128,
      content: 'template-servicos.pdf'
    },
    {
      id: 2,
      name: 'Termo de Confidencialidade',
      category: 'Legal',
      lastModified: '14/03/2024',
      downloads: 85,
      content: 'template-nda.pdf'
    },
    {
      id: 3,
      name: 'Contrato de Parceria Comercial',
      category: 'Comercial',
      lastModified: '13/03/2024',
      downloads: 234,
      content: 'template-parceria.pdf'
    },
    {
      id: 4,
      name: 'Contrato de Trabalho CLT',
      category: 'RH',
      lastModified: '12/03/2024',
      downloads: 456,
      content: 'template-clt.pdf'
    }
  ]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || template.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleDownload = (template: Template) => {
    toast.success(`Download iniciado: ${template.name}`);
    
    setTemplates(prev => 
      prev.map(t => 
        t.id === template.id 
          ? { ...t, downloads: t.downloads + 1 }
          : t
      )
    );
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Modelo excluído com sucesso!');
    }
  };

  const handleSaveTemplate = (name: string, content: string) => {
    if (editingTemplate) {
      // Editando template existente
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id
          ? { 
              ...t, 
              name, 
              content,
              lastModified: new Date().toLocaleDateString() 
            }
          : t
      ));
      toast.success('Modelo atualizado com sucesso!');
    } else {
      // Novo template
      const newTemplate: Template = {
        id: templates.length + 1,
        name,
        category: 'Geral',
        lastModified: new Date().toLocaleDateString(),
        downloads: 0,
        content
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Modelo salvo com sucesso!');
    }
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Modelos de Contratos</h1>
          <Button onClick={handleNewTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar modelos..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="todos">Todas as categorias</option>
                <option value="servicos">Serviços</option>
                <option value="legal">Legal</option>
                <option value="comercial">Comercial</option>
                <option value="rh">RH</option>
              </select>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum modelo encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Última modificação: {template.lastModified}</span>
                    <span>{template.downloads} downloads</span>
                  </div>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(template)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <ContractTemplateEditor 
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          }}
          onSave={handleSaveTemplate}
          initialContent={editingTemplate?.content}
          initialName={editingTemplate?.name}
        />
      )}
    </>
  );
};

export default ContractTemplates;