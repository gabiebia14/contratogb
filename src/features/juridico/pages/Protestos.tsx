
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Protestos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Por favor, informe um CNPJ ou CPF para pesquisar.');
      return;
    }

    setIsSearching(true);
    
    // Simulando uma chamada de API
    setTimeout(() => {
      setIsSearching(false);
      setHasResults(true);
      toast.success('Consulta realizada com sucesso!');
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consulta de Protestos</h2>
          <p className="text-muted-foreground">
            Consulte e analise protestos em cartórios usando inteligência artificial
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Protestos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  placeholder="Digite o CNPJ ou CPF para consultar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <>Pesquisando...</>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Consultar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasResults && (
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
                      <p className="text-lg font-semibold">3</p>
                      <p className="text-sm text-gray-600">Protestos Ativos</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-6 rounded-lg flex items-center gap-4">
                    <FileText className="h-10 w-10 text-amber-500" />
                    <div>
                      <p className="text-lg font-semibold">R$ 12.450,00</p>
                      <p className="text-sm text-gray-600">Valor Total</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg flex items-center gap-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <div>
                      <p className="text-lg font-semibold">2</p>
                      <p className="text-sm text-gray-600">Protestos Baixados</p>
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
                  {[
                    {
                      id: 1,
                      cartorio: "4º Cartório de Protestos de São Paulo",
                      data: "15/05/2023",
                      valor: "R$ 5.450,00",
                      status: "Ativo"
                    },
                    {
                      id: 2,
                      cartorio: "2º Cartório de Protestos de São Paulo",
                      data: "03/06/2023",
                      valor: "R$ 3.800,00",
                      status: "Ativo"
                    },
                    {
                      id: 3,
                      cartorio: "1º Cartório de Protestos de Campinas",
                      data: "22/06/2023",
                      valor: "R$ 3.200,00",
                      status: "Ativo"
                    },
                  ].map((protesto) => (
                    <div 
                      key={protesto.id}
                      className="border p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{protesto.cartorio}</h4>
                          <p className="text-sm text-gray-500">Data: {protesto.data}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{protesto.valor}</p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            {protesto.status}
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
                  {[
                    {
                      id: 1,
                      cartorio: "4º Cartório de Protestos de São Paulo",
                      data: "15/05/2023",
                      valor: "R$ 5.450,00",
                      status: "Ativo",
                      credor: "Banco XYZ S.A.",
                      documento: "Duplicata Mercantil",
                      numero: "DM-2023-5678",
                      endereco: "Av. Paulista, 1000, São Paulo - SP"
                    },
                    {
                      id: 2,
                      cartorio: "2º Cartório de Protestos de São Paulo",
                      data: "03/06/2023",
                      valor: "R$ 3.800,00",
                      status: "Ativo",
                      credor: "Fornecedor ABC Ltda.",
                      documento: "Duplicata de Serviço",
                      numero: "DS-2023-9012",
                      endereco: "Rua Augusta, 500, São Paulo - SP"
                    },
                    {
                      id: 3,
                      cartorio: "1º Cartório de Protestos de Campinas",
                      data: "22/06/2023",
                      valor: "R$ 3.200,00",
                      status: "Ativo",
                      credor: "Distribuidora XYZ Ltda.",
                      documento: "Duplicata Mercantil",
                      numero: "DM-2023-3456",
                      endereco: "Av. Francisco Glicério, 100, Campinas - SP"
                    },
                  ].map((protesto) => (
                    <Card key={protesto.id} className="shadow-sm">
                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{protesto.cartorio}</CardTitle>
                          <span className="inline-block px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                            {protesto.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Credor</p>
                            <p className="font-medium">{protesto.credor}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Valor</p>
                            <p className="font-medium">{protesto.valor}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Documento</p>
                            <p className="font-medium">{protesto.documento}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Número</p>
                            <p className="font-medium">{protesto.numero}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Data</p>
                            <p className="font-medium">{protesto.data}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Endereço</p>
                            <p className="font-medium">{protesto.endereco}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Documento
                          </Button>
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
                <CardTitle>Análise de IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumo</h3>
                    <p className="text-blue-700">
                      Encontramos 3 protestos ativos no valor total de R$ 12.450,00. Todos os protestos são
                      recentes (menos de 90 dias) e estão relacionados a duplicatas mercantis e de serviços. 
                      Os protestos foram registrados em cartórios de São Paulo e Campinas.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Recomendações</h3>
                    <ul className="space-y-2 list-disc pl-5 text-amber-700">
                      <li>Considere entrar em contato com os credores para negociar os valores e evitar complicações futuras.</li>
                      <li>A soma dos protestos (R$ 12.450,00) pode afetar significativamente a capacidade de crédito.</li>
                      <li>Os protestos de duplicatas mercantis podem indicar problemas de fluxo de caixa no período.</li>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
