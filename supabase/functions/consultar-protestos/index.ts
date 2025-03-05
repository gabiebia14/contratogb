
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf, cnpj, ieptb_login, ieptb_senha, obter_detalhes_sp, limite_detalhes_sp, lightweight } = await req.json();

    console.log("Recebendo consulta de protestos com os dados:");
    console.log(`CPF: ${cpf || 'Não informado'}`);
    console.log(`CNPJ: ${cnpj || 'Não informado'}`);
    
    // Verificação básica dos parâmetros obrigatórios
    if ((!cpf && !cnpj) || !ieptb_login || !ieptb_senha) {
      return new Response(
        JSON.stringify({ 
          error: "Parâmetros obrigatórios não informados. Forneça CPF ou CNPJ, login e senha do IEPTB." 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Em um ambiente real, usaríamos Puppeteer para acessar o site
    // Aqui, simulamos uma resposta com dados fictícios baseados no modelo fornecido
    const mockResponse = {
      "BalanceInBrl": 0,
      "BalanceInCredits": 0,
      "DataSourceCategory": "CENPROT",
      "Date": new Date().toISOString(),
      "ElapsedTimeInMilliseconds": 1520,
      "HasPdf": true,
      "Message": "Consulta realizada com sucesso",
      "OriginalFilesUrl": "https://exemplo.com/arquivos/123",
      "OutdatedResult": false,
      "PdfUrl": "https://exemplo.com/resultado/123.pdf",
      "TotalCost": 15.75,
      "TotalCostInCredits": 1,
      "TransactionResultType": "Success",
      "TransactionResultTypeCode": 0,
      "UniqueIdentifier": "abc123xyz456",
      "Result": {
        "DataConsulta": new Date().toLocaleDateString('pt-BR'),
        "CpfCnpj": cpf || cnpj,
        "QtdTitulos": 2,
        "Status": "Protestos Encontrados",
        "Mensagem": {
          "_Mensagem": "Foram encontrados protestos para o documento informado."
        },
        "Cartorio": [
          {
            "ProtestoStatus": "Ativo",
            "ProtestoComarca": "São Paulo",
            "ProtestoNumeroProtocolo": "12345/2023",
            "ProtestoDataAbertura": "2023-01-15T00:00:00Z",
            "ProtestoDataProtesto": "2023-01-25T00:00:00Z",
            "CartorioNome": "1º Tabelionato de Protestos de São Paulo",
            "CartorioEndereco": "Rua Exemplo, 123",
            "CartorioBairro": "Centro",
            "CartorioLocalidade": "São Paulo",
            "CartorioCEP": "01234-567",
            "CartorioEmail": "contato@cartorio1sp.com.br",
            "CartorioTelefone": "(11) 2345-6789"
          },
          {
            "ProtestoStatus": "Ativo",
            "ProtestoComarca": "São Paulo",
            "ProtestoNumeroProtocolo": "67890/2023",
            "ProtestoDataAbertura": "2023-02-10T00:00:00Z",
            "ProtestoDataProtesto": "2023-02-20T00:00:00Z",
            "CartorioNome": "4º Tabelionato de Protestos de São Paulo",
            "CartorioEndereco": "Av. Exemplo, 456",
            "CartorioBairro": "Jardins",
            "CartorioLocalidade": "São Paulo",
            "CartorioCEP": "04567-890",
            "CartorioEmail": "contato@cartorio4sp.com.br",
            "CartorioTelefone": "(11) 3456-7890"
          }
        ],
        "NormalizedValorTotalProtestos": 12450.00,
        "NormalizedResumoProtestos": [
          {
            "Uf": "SP",
            "Municipio": "São Paulo",
            "CodigoCartorio": "01",
            "Descricao": "1º Tabelionato de Protestos de São Paulo",
            "Telefone": "(11) 2345-6789",
            "NumeroProtestos": 1,
            "ValorProtestado": 5450.00,
            "DocDevedor": cpf || cnpj,
            "DataProtesto": "2023-01-25T00:00:00Z",
            "DataVencimento": "2023-01-15T00:00:00Z",
            "DataAtualizacao": "2023-05-15T00:00:00Z"
          },
          {
            "Uf": "SP",
            "Municipio": "São Paulo",
            "CodigoCartorio": "04",
            "Descricao": "4º Tabelionato de Protestos de São Paulo",
            "Telefone": "(11) 3456-7890",
            "NumeroProtestos": 1,
            "ValorProtestado": 7000.00,
            "DocDevedor": cpf || cnpj,
            "DataProtesto": "2023-02-20T00:00:00Z",
            "DataVencimento": "2023-02-10T00:00:00Z",
            "DataAtualizacao": "2023-05-15T00:00:00Z"
          }
        ],
        "NormDataConsulta": new Date().toISOString()
      }
    };

    // Em uma implementação real com Puppeteer, seria algo como:
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://site.cenprotnacional.org.br/consulta');
    
    // Login no sistema
    await page.type('#login', ieptb_login);
    await page.type('#senha', ieptb_senha);
    await page.click('#btnLogin');
    
    // Preencher formulário de consulta
    if (cpf) await page.type('#cpf', cpf);
    if (cnpj) await page.type('#cnpj', cnpj);
    
    if (obter_detalhes_sp) {
      await page.select('#obterDetalhesSp', 'true');
      if (limite_detalhes_sp) {
        await page.type('#limiteDetalhesSp', limite_detalhes_sp.toString());
      }
    }
    
    await page.click('#btnConsultar');
    await page.waitForSelector('#resultado');
    
    const resultado = await page.evaluate(() => {
      return JSON.parse(document.querySelector('#resultado').textContent);
    });
    
    await browser.close();
    */

    return new Response(
      JSON.stringify(mockResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na consulta de protestos:', error);
    return new Response(
      JSON.stringify({ error: `Falha na consulta: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
