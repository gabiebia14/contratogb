
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contrato de Prestação de Serviços',
    type: 'Contrato',
    date: '2024-02-15',
    status: 'Ativo'
  },
  {
    id: '2',
    name: 'Termo de Confidencialidade',
    type: 'Termo',
    date: '2024-02-14',
    status: 'Em análise'
  },
  {
    id: '3',
    name: 'Procuração',
    type: 'Documento',
    date: '2024-02-13',
    status: 'Pendente'
  }
];

export default function Documents() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Button onClick={() => navigate('/juridico/new-document')}>
          <Upload className="w-4 h-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{doc.name}</h3>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{new Date(doc.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm 
                  ${doc.status === 'Ativo' ? 'bg-green-100 text-green-800' : 
                    doc.status === 'Em análise' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {doc.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
