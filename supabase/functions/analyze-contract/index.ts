
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  GoogleGenerativeAI,
} from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const { content } = await req.json();
    
    if (!content) {
      throw new Error('Conteúdo é obrigatório');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('Iniciando análise do contrato...');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,     // Set to 0 for most deterministic output
        topP: 1,           // Maximum sampling
        topK: 1,           // Most likely token
        maxOutputTokens: 8192,
      }
    });

    const prompt = `
      Você é um assistente especialista em analisar contratos.
      Substitua todas as informações pessoais no contrato pelos parâmetros especificados.
      
      INSTRUÇÕES:
      1. Analise o contrato.
      2. Substitua informações pessoais pelos parâmetros correspondentes.
      3. Retorne um objeto JSON com o texto modificado e as variáveis encontradas.

      EXEMPLO DE RESPOSTA:
      {
        "text": "CONTRATO DE LOCAÇÃO\\n\\nLOCADOR: {locador_nome}, {locador_nacionalidade}...",
        "variables": {
          "locador_nome": "Nome do locador",
          "locador_cpf": "CPF do locador"
        }
      }

      PARÂMETROS DISPONÍVEIS:
      - LOCADOR: {locador_nome}, {locador_cpf}, {locador_rg}
      - LOCATÁRIO: {locatario_nome}, {locatario_cpf}, {locatario_rg}
      - FIADOR: {fiador_nome}, {fiador_cpf}, {fiador_rg}

      REGRAS:
      1. Retorne apenas JSON válido
      2. Use apenas aspas duplas
      3. Escape caracteres especiais
      4. Preserve quebras de linha com \\n

      CONTRATO:
      ${content}
    `;

    console.log('Enviando prompt para o Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Resposta recebida do Gemini');

    try {
      // Limpar a resposta
      const cleanText = text
        .replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
        .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
        .replace(/^[\s\S]*?(\{)/m, '{')
        .replace(/\}[\s\S]*$/m, '}')
        .trim();
      
      console.log('Tentando fazer parse do JSON:', cleanText);

      const parsedResponse = JSON.parse(cleanText);

      // Validação estrita da estrutura
      if (typeof parsedResponse !== 'object' || parsedResponse === null) {
        throw new Error('Resposta não é um objeto JSON válido');
      }

      if (typeof parsedResponse.text !== 'string' || parsedResponse.text.trim() === '') {
        throw new Error('Campo "text" inválido ou vazio');
      }

      if (typeof parsedResponse.variables !== 'object' || parsedResponse.variables === null) {
        throw new Error('Campo "variables" inválido');
      }

      // Validar que todas as variáveis são strings
      for (const [key, value] of Object.entries(parsedResponse.variables)) {
        if (typeof value !== 'string') {
          throw new Error(`Variável "${key}" não é uma string`);
        }
      }

      return new Response(
        JSON.stringify(parsedResponse),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error('Erro ao processar resposta:', parseError);
      throw new Error(`Erro ao processar resposta do modelo: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
