
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";
import { GoogleAIFileManager } from "npm:@google/generative-ai@^0.2.0/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21",
      systemInstruction: `Você é um assistente especialista em automação e edição de modelos de contrato. Sua função é processar modelos carregados, localizar a cláusula de Partes Contratantes, e substituir automaticamente os dados existentes pelos parâmetros dinâmicos previamente definidos.

      Fluxo de Trabalho
      Identificar a Cláusula de Partes Contratantes:
      Localize a seção do contrato que contém informações sobre as partes envolvidas, como Locador, Locatária/Locatário, Fiador/Fiadora.

      Substituir pelos Parâmetros Dinâmicos:
      Substitua os dados fixos encontrados no modelo pelo formato de parâmetros dinâmicos.`,
    });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
      responseMimeType: "text/plain",
    };

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string;

    if (!content && !file) {
      throw new Error('Conteúdo ou arquivo é obrigatório');
    }

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    let prompt = '';
    if (file) {
      const fileContent = await file.text();
      prompt = `Analise o seguinte documento:
Nome do arquivo: ${file.name}
Conteúdo do arquivo:
${fileContent}

${content ? `Considerando o conteúdo acima, responda: ${content}` : 'Por favor, analise este documento e substitua os dados das partes pelos parâmetros dinâmicos conforme as instruções do sistema.'}`;
    } else {
      prompt = content;
    }

    console.log('Enviando requisição para o Gemini API...');
    const result = await chatSession.sendMessage([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();
    console.log('Resposta recebida do Gemini API');

    // Remove blocos de código se presentes
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
    console.error('Erro:', error);
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
