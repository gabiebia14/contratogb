
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
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

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    const systemInstruction = `
      Você é um assistente especialista em automação e edição de modelos de contrato. 
      Sua função é processar modelos carregados, localizar a cláusula de Partes Contratantes, 
      e substituir automaticamente os dados existentes pelos parâmetros dinâmicos previamente definidos.

      Fluxo de Trabalho:
      1. Identificar a Cláusula de Partes Contratantes
      2. Substituir pelos Parâmetros Dinâmicos
      3. Retornar um objeto JSON com:
         - text: O texto atualizado com os parâmetros
         - variables: Um objeto com os parâmetros encontrados

      Parâmetros a serem utilizados:
      LOCADOR:
      - {locador_nome}
      - {locador_nacionalidade}
      - {locador_estado_civil}
      - {locador_profissao}
      - {locador_rg}
      - {locador_cpf}
      - {locador_endereco}
      - {locador_bairro}
      - {locador_cep}
      - {locador_cidade}
      - {locador_estado}

      LOCATÁRIO(A):
      - {locatario_nome} ou {locataria_nome}
      - {locatario_nacionalidade} ou {locataria_nacionalidade}
      - {locatario_estado_civil} ou {locataria_estado_civil}
      - {locatario_profissao} ou {locataria_profissao}
      - {locatario_rg} ou {locataria_rg}
      - {locatario_cpf} ou {locataria_cpf}
      - {locatario_endereco} ou {locataria_endereco}
      - {locatario_bairro} ou {locataria_bairro}
      - {locatario_cep} ou {locataria_cep}
      - {locatario_cidade} ou {locataria_cidade}
      - {locatario_estado} ou {locataria_estado}
      - {locatario_telefone} ou {locataria_telefone}
      - {locatario_email} ou {locataria_email}

      FIADOR(A):
      - {fiador_nome} ou {fiadora_nome}
      - {fiador_nacionalidade} ou {fiadora_nacionalidade}
      - {fiador_estado_civil} ou {fiadora_estado_civil}
      - {fiador_profissao} ou {fiadora_profissao}
      - {fiador_rg} ou {fiadora_rg}
      - {fiador_cpf} ou {fiadora_cpf}
      - {fiador_endereco} ou {fiadora_endereco}
      - {fiador_bairro} ou {fiadora_bairro}
      - {fiador_cep} ou {fiador_cep}
      - {fiador_cidade} ou {fiador_cidade}
      - {fiador_estado} ou {fiadora_estado}
      - {fiador_telefone} ou {fiadora_telefone}
    `;

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: content }],
        },
      ],
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const prompt = `
      ${systemInstruction}

      Analise o contrato a seguir e retorne um JSON com:
      {
        "text": "texto do contrato com os parâmetros substituídos",
        "variables": {
          "nome_variavel": "Descrição do campo"
        }
      }

      Contrato:
      ${content}
    `;

    const result = await chatSession.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      // Remove blocos de código e limpa o texto
      const cleanText = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                           .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
                           .trim();
      
      const parsedResponse = JSON.parse(cleanText);

      return new Response(
        JSON.stringify(parsedResponse),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error('Erro ao processar resposta:', parseError);
      throw new Error('Erro ao processar resposta do modelo');
    }
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
