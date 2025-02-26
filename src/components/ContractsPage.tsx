
import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Loader2, Building2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@/types/properties';

const ContractsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [contractTitle, setContractTitle] = useState('');
  const [contractType, setContractType] = useState('lease');
  const [tenantName, setTenantName] = useState('');
  const [tenantDocument, setTenantDocument] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: contracts, isLoading: contractsLoading, refetch: refetchContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          template:contract_templates(name),
          document:processed_documents(file_name),
          property:properties(address, city)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        toast.error("Erro ao carregar contratos");
        throw error;
      }

      return data || [];
    }
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast.error("Erro ao carregar imóveis");
        throw error;
      }

      return data as Property[];
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPropertyId || !contractTitle) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setUploading(true);

    try {
      // Upload do arquivo para o storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${selectedPropertyId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property_contracts')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Criar registro do contrato no banco
      const { error: contractError } = await supabase
        .from('contracts')
        .insert([{
          title: contractTitle,
          property_id: selectedPropertyId,
          file_path: filePath,
          contract_type: contractType,
          tenant_name: tenantName,
          tenant_document: tenantDocument,
          lease_start: leaseStart || null,
          lease_end: leaseEnd || null,
          status: 'active'
        }]);

      if (contractError) {
        throw contractError;
      }

      toast.success('Contrato adicionado com sucesso!');
      setShowAddDialog(false);
      refetchContracts();
      resetForm();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao adicionar contrato');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedPropertyId('');
    setContractTitle('');
    setContractType('lease');
    setTenantName('');
    setTenantDocument('');
    setLeaseStart('');
    setLeaseEnd('');
  };

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('property_contracts')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Criar URL do blob e iniciar download
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'contrato.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar contrato');
    }
  };

  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Rascunho',
      'active': 'Ativo',
      'pending': 'Pendente',
      'expired': 'Expirado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'expired':
        return 'bg-red-100 text-red-600';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (contractsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar contratos..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="expired">Expirado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  Adicionar Contrato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Contrato</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título do Contrato</Label>
                    <Input
                      id="title"
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      placeholder="Ex: Contrato de Locação - Apartamento Centro"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="property">Imóvel</Label>
                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties?.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.address} - {property.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Contrato</Label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">Locação</SelectItem>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tenant">Nome do Locatário/Comprador</Label>
                    <Input
                      id="tenant"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
                    <Input
                      id="document"
                      value={tenantDocument}
                      onChange={(e) => setTenantDocument(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start">Data Início</Label>
                      <Input
                        id="start"
                        type="date"
                        value={leaseStart}
                        onChange={(e) => setLeaseStart(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end">Data Fim</Label>
                      <Input
                        id="end"
                        type="date"
                        value={leaseEnd}
                        onChange={(e) => setLeaseEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">Arquivo do Contrato (PDF)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </div>

                  <Button 
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile || !selectedPropertyId || !contractTitle}
                  >
                    {uploading ? 'Enviando...' : 'Adicionar Contrato'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredContracts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum contrato encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-gray-500 text-sm">
                <tr>
                  <th className="pb-4">Nome</th>
                  <th className="pb-4">Imóvel</th>
                  <th className="pb-4">Locatário</th>
                  <th className="pb-4">Período</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="border-t">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-indigo-600" size={16} />
                        </div>
                        {contract.title}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {contract.property?.address}
                      </div>
                    </td>
                    <td className="py-4">{contract.tenant_name || '-'}</td>
                    <td className="py-4">
                      {contract.lease_start && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(contract.lease_start).toLocaleDateString()} até{' '}
                          {contract.lease_end ? new Date(contract.lease_end).toLocaleDateString() : 'N/A'}
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(contract.status)}`}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {contract.file_path && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(contract.file_path)}
                            title="Download"
                          >
                            <Download size={20} className="text-gray-500" />
                          </Button>
                        )}
                        <Button 
                          variant="link"
                          onClick={() => navigate(`/juridico/contracts/${contract.id}`)}
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractsPage;
