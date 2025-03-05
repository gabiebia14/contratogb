import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, AlertCircle, CheckCircle, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProtestoCartorio {
  ProtestoStatus: string;
  ProtestoComarca: string;
  ProtestoNumeroProtocolo: string;
  ProtestoDataAbertura: string;
  ProtestoDataProtesto: string;
  CartorioNome: string;
  CartorioEndereco: string;
  CartorioBairro: string;
  CartorioLocalidade: string;
  CartorioCEP: string;
  CartorioEmail: string;
  CartorioTelefone: string;
}

interface ProtestoResumo {
  Uf: string;
  Municipio: string;
  CodigoCartorio: string;
  Descricao: string;
  Telefone: string;
  NumeroProtestos: number;
  ValorProtestado: number;
  DocDevedor: string;
  DataProtesto: string;
  DataVencimento: string;
  DataAtualizacao: string;
}

interface ProtestoResult {
  DataConsulta: string;
  CpfCnpj: string;
  QtdTitulos: number;
  Status: string;
  Mensagem: {
    _Mensagem: string;
  };
  Cartorio: ProtestoCartorio[];
  NormalizedValorTotalProtestos: number;
  NormalizedResumoProtestos: ProtestoResumo[];
  NormDataConsulta: string;
}

interface ProtestoResponse {
  BalanceInBrl: number;
  BalanceInCredits: number;
  DataSourceCategory: string;
  Date: string;
  ElapsedTimeInMilliseconds: number;
  HasPdf: boolean;
  Message: string;
  OriginalFilesUrl: string;
  OutdatedResult: boolean;
  PdfUrl: string;
  TotalCost: number;
  TotalCostInCredits: number;
  TransactionResultType: string;
  TransactionResultTypeCode: number;
  UniqueIdentifier: string;
  Result: ProtestoResult;
}

export default function Protestos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    cnpj: '',
    obter_detalhes_sp: 'false',
    limite_detalhes_sp: '10',
    lightweight: 'false',
    ieptb_login: '390.829.698-66',
    ieptb_senha: 'Bianca*2014'
  });
  const [resultado, setResultado] = useState<ProtestoResponse | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.cpf && !formData.cnpj) {
      toast.error('Por favor, informe um CPF ou CNPJ para consultar.');
      return;
    }

    setIsSearching(true);
    setHasResults(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('consultar-protestos', {
        body: formData
      });

      if (error) {
        console.error('Erro ao consultar protestos:', error);
        toast.error(`Falha na consulta: ${error.message}`);
        return;
      }

      console.log('Resultado da consulta:', data);
      
      setResultado(data);
      setHasResults(true);
      toast.success('Consulta realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao consultar protestos:', error);
      toast.error(`Erro ao processar a consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consulta de Protestos</h2>
          <p className="text-muted-foreground">
            Consulte e analise protestos em cartórios usando API do CENPROT
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Protestos</CardTitle>
          <CardDescription>
            Fonte: <a href="https://site.cenprotnacional.org.br/consulta" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://site.cenprotnacional.org.br/consulta</a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (apenas um dos campos é necessário)</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="Digite o CPF para consultar"
                  value={formData.cpf}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ (apenas um dos campos é necessário)</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  placeholder="Digite o CNPJ para consultar"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obter_detalhes_sp">Obter detalhes de SP</Label>
                <Select 
                  value={formData.obter_detalhes_sp} 
                  onValueChange={(value) => handleSelectChange('obter_detalhes_sp', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limite_detalhes_sp">Limite de detalhes SP</Label>
                <Input
                  id="limite_detalhes_sp"
                  name="limite_detalhes_sp"
                  type="number"
                  placeholder="Limite de detalhes"
                  value={formData.limite_detalhes_sp}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lightweight">Modo Lightweight</Label>
                <Select 
                  value={formData.lightweight} 
                  onValueChange={(value) => handleSelectChange('lightweight', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSearching}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Consultar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasResults && resultado && (
        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="analise">Análise de IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Protestos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 p-6 rounded-lg flex items-center gap-4">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                    <div>
                      <p className="text-lg font-semibold">{resultado.Result.QtdTitulos}</p>
                      <p className="text-sm text-gray-600">Protestos Ativos</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-6 rounded-lg flex items-center gap-4">
                    <FileText className="h-10 w-10 text-amber-500" />
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(resultado.Result.NormalizedValorTotalProtestos)}</p>
                      <p className="text-sm text-gray-600">Valor Total</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg flex items-center gap-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(resultado.TotalCost)}</p>
                      <p className="text-sm text-gray-600">Custo da Consulta</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Protestos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resultado.Result.NormalizedResumoProtestos.map((protesto, index) => (
                    <div 
                      key={index}
                      className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{protesto.Descricao}</h4>
                          <p className="text-sm text-gray-500">Data: {formatDate(protesto.DataProtesto)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(protesto.ValorProtestado)}</p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Ativo
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detalhes">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Protestos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {resultado.Result.Cartorio.map((protesto, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{protesto.CartorioNome}</CardTitle>
                          <span className="inline-block px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                            {protesto.ProtestoStatus}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Comarca</p>
                            <p className="font-medium">{protesto.ProtestoComarca}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Protocolo</p>
                            <p className="font-medium">{protesto.ProtestoNumeroProtocolo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Data de Abertura</p>
                            <p className="font-medium">{formatDate(protesto.ProtestoDataAbertura)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Data de Protesto</p>
                            <p className="font-medium">{formatDate(protesto.ProtestoDataProtesto)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Endereço</p>
                            <p className="font-medium">{protesto.CartorioEndereco}, {protesto.CartorioBairro}, {protesto.CartorioLocalidade}, {protesto.CartorioCEP}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Contato</p>
                            <p className="font-medium">Tel: {protesto.CartorioTelefone} | Email: {protesto.CartorioEmail}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analise">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Protestos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumo</h3>
                    <p className="text-blue-700">
                      Encontramos {resultado.Result.QtdTitulos} protestos ativos no valor total de {formatCurrency(resultado.Result.NormalizedValorTotalProtestos)}. 
                      Todos os protestos são recentes (menos de 90 dias) e estão relacionados a títulos protestados em cartórios de {resultado.Result.NormalizedResumoProtestos[0]?.Uf || "SP"}.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Recomendações</h3>
                    <ul className="space-y-2 list-disc pl-5 text-amber-700">
                      <li>Considere entrar em contato com os credores para negociar os valores e evitar complicações futuras.</li>
                      <li>A soma dos protestos ({formatCurrency(resultado.Result.NormalizedValorTotalProtestos)}) pode afetar significativamente a capacidade de crédito.</li>
                      <li>Os protestos podem indicar problemas de fluxo de caixa no período.</li>
                      <li>Recomendamos preparar um plano de pagamento e regularização em até 30 dias.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Impacto Legal</h3>
                    <p className="text-gray-700 mb-4">
                      Os protestos identificados podem gerar as seguintes consequências legais:
                    </p>
                    <ul className="space-y-2 list-disc pl-5 text-gray-700">
                      <li>Restrição de crédito em instituições financeiras</li>
                      <li>Dificuldades em transações comerciais com fornecedores</li>
                      <li>Possíveis ações de cobrança judicial pelos credores</li>
                      <li>Impacto na pontuação de crédito por até 5 anos após a baixa</li>
                    </ul>
                  </div>
                  
                  {resultado.HasPdf && (
                    <div className="flex justify-center mt-6">
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF do Relatório
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
