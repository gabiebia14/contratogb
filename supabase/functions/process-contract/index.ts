
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

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
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    const result = await model.generateContent([
      {
        text: `Analise o seguinte contrato e retorne um JSON com:
        {
          "text": "texto do contrato com os parâmetros substituídos",
          "variables": {
            "nome_variavel": "Descrição do campo"
          }
        }

        Contrato:
        ${content}`
      }
    ]);

    const response = await result.response;
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
