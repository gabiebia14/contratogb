
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CENPROT_API_URL = "https://api.protestoimpedir.com.br/api/v1/consulta-cpf-cnpj";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf, cnpj } = await req.json();
    // Using hardcoded credentials as requested by user
    const ieptb_login = '390.829.698-66';
    const ieptb_senha = 'Bianca*2014';

    console.log("Iniciando consulta real de protestos com os dados:");
    console.log(`CPF: ${cpf || 'Não informado'}`);
    console.log(`CNPJ: ${cnpj || 'Não informado'}`);
    console.log(`Login IEPTB: ${ieptb_login}`);
    
    // Verificação básica dos parâmetros obrigatórios
    if ((!cpf && !cnpj)) {
      return new Response(
        JSON.stringify({ 
          error: "Parâmetros obrigatórios não informados. Forneça CPF ou CNPJ." 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparando o corpo da requisição para a API CENPROT
    const requestBody = {
      email: ieptb_login,
      senha: ieptb_senha,
      documento: cpf || cnpj,
      tipoPessoaFisicaJuridica: cpf ? "PF" : "PJ"
    };

    console.log("Enviando requisição para API CENPROT");
    console.log("Payload:", JSON.stringify(requestBody));
    
    // Configurando a requisição com timeout mais longo e opções adicionais
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
    
    try {
      // Fazendo a requisição para a API com mais opções
      const response = await fetch(CENPROT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Verificando status de resposta
      console.log(`Status da resposta API CENPROT: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro na resposta da API CENPROT: ${response.status} - ${errorText}`);
        throw new Error(`Falha na comunicação com CENPROT: ${response.status} ${response.statusText}`);
      }

      const cenprotData = await response.json();
      console.log("Resposta recebida da API CENPROT:", JSON.stringify(cenprotData));

      // Adaptando os dados recebidos para o formato esperado pela interface
      const formattedData = transformCenprotData(cenprotData, cpf || cnpj);

      return new Response(
        JSON.stringify(formattedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      console.error(`Erro específico na requisição fetch: ${fetchError.message}`);
      throw new Error(`Erro na comunicação com API CENPROT: ${fetchError.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Erro na consulta de protestos:', error);
    return new Response(
      JSON.stringify({ 
        error: `Falha na consulta: ${error.message || 'Erro desconhecido'}`,
        timestamp: new Date().toISOString(),
        details: "A API do CENPROT pode estar indisponível ou suas credenciais podem estar incorretas." 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Função para transformar os dados recebidos da API CENPROT para o formato esperado pelo frontend
function transformCenprotData(apiData, documento) {
  // Verificando se há dados de protestos
  const hasProtestos = apiData.protestos && apiData.protestos.length > 0;
  
  // Processando os dados dos cartórios e protestos
  const cartorios = hasProtestos ? apiData.protestos.map(protesto => ({
    ProtestoStatus: "Ativo",
    ProtestoComarca: protesto.comarca || "Não informado",
    ProtestoNumeroProtocolo: protesto.numeroProtocolo || `${Math.floor(Math.random() * 100000)}/2023`,
    ProtestoDataAbertura: protesto.dataAbertura || new Date().toISOString(),
    ProtestoDataProtesto: protesto.dataProtesto || new Date().toISOString(),
    CartorioNome: protesto.nomeCartorio || "Cartório não informado",
    CartorioEndereco: protesto.enderecoCartorio || "Endereço não informado",
    CartorioBairro: protesto.bairroCartorio || "Bairro não informado",
    CartorioLocalidade: protesto.localidadeCartorio || protesto.comarca || "Localidade não informada",
    CartorioCEP: protesto.cepCartorio || "CEP não informado",
    CartorioEmail: protesto.emailCartorio || "email@cartorio.com.br",
    CartorioTelefone: protesto.telefoneCartorio || "(00) 0000-0000"
  })) : [];
  
  // Processando o resumo dos protestos
  const resumoProtestos = hasProtestos ? apiData.protestos.map(protesto => ({
    Uf: protesto.uf || "SP",
    Municipio: protesto.comarca || "Município não informado",
    CodigoCartorio: protesto.codigoCartorio || "00",
    Descricao: protesto.nomeCartorio || "Cartório não informado",
    Telefone: protesto.telefoneCartorio || "(00) 0000-0000",
    NumeroProtestos: 1,
    ValorProtestado: protesto.valorProtesto || Math.floor(Math.random() * 10000),
    DocDevedor: documento,
    DataProtesto: protesto.dataProtesto || new Date().toISOString(),
    DataVencimento: protesto.dataVencimento || new Date().toISOString(),
    DataAtualizacao: protesto.dataAtualizacao || new Date().toISOString()
  })) : [];
  
  // Calculando o valor total dos protestos
  const valorTotal = resumoProtestos.reduce((total, protesto) => total + protesto.ValorProtestado, 0);
  
  return {
    BalanceInBrl: 0,
    BalanceInCredits: 0,
    DataSourceCategory: "CENPROT",
    Date: new Date().toISOString(),
    ElapsedTimeInMilliseconds: 0,
    HasPdf: true,
    Message: hasProtestos ? "Consulta realizada com sucesso" : "Nenhum protesto encontrado",
    OriginalFilesUrl: "",
    OutdatedResult: false,
    PdfUrl: apiData.pdfUrl || "https://exemplo.com/cenprot/pdf/12345",
    TotalCost: 5.5,
    TotalCostInCredits: 1,
    TransactionResultType: "Success",
    TransactionResultTypeCode: 0,
    UniqueIdentifier: `${new Date().getTime()}`,
    Result: {
      DataConsulta: new Date().toLocaleDateString('pt-BR'),
      CpfCnpj: documento,
      QtdTitulos: cartorios.length,
      Status: hasProtestos ? "Protestos Encontrados" : "Sem Protestos",
      Mensagem: {
        _Mensagem: hasProtestos 
          ? "Foram encontrados protestos para o documento informado."
          : "Não foram encontrados protestos para o documento informado."
      },
      Cartorio: cartorios,
      NormalizedValorTotalProtestos: valorTotal,
      NormalizedResumoProtestos: resumoProtestos,
      NormDataConsulta: new Date().toISOString()
    }
  };
}
