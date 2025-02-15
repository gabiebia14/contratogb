
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
        temperature: 0.1, // Reduced temperature for more deterministic output
        topP: 0.1,       // Reduced top_p for more focused output
        topK: 1,         // Reduced top_k for more consistent output
        maxOutputTokens: 8192,
      }
    });

    const prompt = `
      Você é um assistente especialista em automação de contratos. Analise o contrato fornecido
      e substitua todas as ocorrências de informações pessoais pelos parâmetros dinâmicos correspondentes.
      
      Você DEVE retornar APENAS um objeto JSON válido no seguinte formato, sem qualquer texto adicional:
      {
        "text": "texto do contrato com os parâmetros substituídos",
        "variables": {
          "nome_do_parametro": "descrição do campo"
        }
      }

      Substitua informações como:
      - Nomes próprios -> {locador_nome}, {locatario_nome}, {fiador_nome}
      - CPFs -> {locador_cpf}, {locatario_cpf}, {fiador_cpf}
      - Endereços -> {locador_endereco}, {locatario_endereco}, {fiador_endereco}

      Parâmetros disponíveis:
      LOCADOR: {locador_nome}, {locador_nacionalidade}, {locador_estado_civil}, {locador_profissao}, 
               {locador_rg}, {locador_cpf}, {locador_endereco}, {locador_bairro}, {locador_cep}, 
               {locador_cidade}, {locador_estado}

      LOCATÁRIO: {locatario_nome}, {locatario_nacionalidade}, {locatario_estado_civil}, 
                 {locatario_profissao}, {locatario_rg}, {locatario_cpf}, {locatario_endereco}, 
                 {locatario_bairro}, {locatario_cep}, {locatario_cidade}, {locatario_estado}, 
                 {locatario_telefone}, {locatario_email}

      FIADOR: {fiador_nome}, {fiador_nacionalidade}, {fiador_estado_civil}, {fiador_profissao}, 
              {fiador_rg}, {fiador_cpf}, {fiador_endereco}, {fiador_bairro}, {fiador_cep}, 
              {fiador_cidade}, {fiador_estado}, {fiador_telefone}

      IMPORTANTE: 
      1. Retorne APENAS o objeto JSON, sem texto adicional ou formatação markdown
      2. Não use aspas simples no JSON, apenas aspas duplas
      3. Escape caracteres especiais corretamente
      4. Verifique se o JSON é válido antes de retornar

      Contrato para análise:
      ${content}
    `;

    console.log('Enviando prompt para o Gemini...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('Resposta do Gemini recebida, tamanho:', text.length);

    try {
      // Remove qualquer formatação markdown ou texto adicional
      const cleanText = text
        .replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
        .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
        .replace(/^[\s\S]*?(\{)/m, '{') // Remove qualquer texto antes do primeiro {
        .replace(/\}[\s\S]*$/m, '}')    // Remove qualquer texto depois do último }
        .trim();
      
      console.log('Texto limpo:', cleanText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanText);
        console.log('JSON parseado com sucesso');
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.log('Texto que falhou o parse:', cleanText);
        throw new Error('Resposta do modelo não está em formato JSON válido. Erro: ' + parseError.message);
      }

      // Validar estrutura da resposta
      if (!parsedResponse.text || typeof parsedResponse.text !== 'string') {
        throw new Error('Campo "text" ausente ou inválido na resposta');
      }
      if (!parsedResponse.variables || typeof parsedResponse.variables !== 'object') {
        throw new Error('Campo "variables" ausente ou inválido na resposta');
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
