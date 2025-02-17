
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

const systemPrompt = `Você é um assistente especialista em automação e edição de modelos de contrato. Sua função é processar modelos carregados, localizar a cláusula de Partes Contratantes, e substituir automaticamente os dados existentes pelos parâmetros dinâmicos previamente definidos.

O formato da resposta deve seguir EXATAMENTE este modelo:

DAS PARTES

LOCADOR: {locador_nome}, {locador_nacionalidade}, {locador_estado_civil},
{locador_profissao}, portador do RG nº. {locador_rg} e do CPF nº. {locador_cpf}, residente
à {locador_endereco}, {locador_bairro}, CEP: {locador_cep},
{locador_cidade} – {locador_estado}.

LOCATÁRIA: {locataria_nome}, pessoa jurídica
de direito privado, inscrita no CNPJ sob o Nº. {locataria_cnpj}, com sede na
{locataria_endereco}, {locataria_bairro}, CEP: {locataria_cep},
na cidade de {locataria_cidade} - {locataria_estado}, Telefone n°. {locataria_telefone}/
{locataria_email}.

FIADOR: {fiador_nome}, {fiador_nacionalidade}, {fiador_estado_civil},
{fiador_profissao}, portador do CPF n°. {fiador_cpf} e RG nº. {fiador_rg} SSP/SP,
residente e domiciliado na {fiador_endereco}, {fiador_bairro}, CEP: {fiador_cep}, na cidade de {fiador_cidade} - {fiador_estado}, Telefone n°. {fiador_telefone}/ {fiador_email}.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato
de Locação Comercial com garantia locatícia na forma de Fiança, que se regerá
pelas cláusulas seguintes e pelas condições descritas no presente.

Analise o documento fornecido e substitua os dados pessoais encontrados pelos parâmetros correspondentes acima. Mantenha a estrutura exata do texto, apenas substituindo as informações por variáveis.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 4096,
      }
    });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string;
    
    if (!content && !file) {
      throw new Error('Conteúdo ou arquivo é obrigatório');
    }

    let prompt = '';
    if (file) {
      const fileContent = await file.text();
      prompt = `${systemPrompt}

Analise o seguinte documento:
Nome do arquivo: ${file.name}
Conteúdo do arquivo:
${fileContent}

Por favor, identifique a seção de Partes Contratantes e substitua os dados pelos parâmetros dinâmicos conforme o modelo fornecido.`;
    } else {
      prompt = `${systemPrompt}

Analise o seguinte texto:
${content}

Por favor, identifique a seção de Partes Contratantes e substitua os dados pelos parâmetros dinâmicos conforme o modelo fornecido.`;
    }

    console.log('Enviando requisição para o Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Resposta recebida do Gemini API');

    // Remove possíveis blocos de código da resposta
    const cleanText = text.replace(/```(?:.*\n)?([\s\S]*?)```/g, '$1').trim();

    return new Response(
      JSON.stringify({ 
        text: cleanText,
        fileProcessed: !!file,
        fileName: file?.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro detalhado:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
