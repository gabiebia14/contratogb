
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      model: "gemini-2.0-flash-thinking-exp-01-21",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
      }
    });

    let content = '';
    let fileContent = '';

    // Handle both FormData and JSON requests
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      content = formData.get('content') as string || '';
      
      if (file) {
        fileContent = await file.text();
      }
    } else {
      const json = await req.json();
      content = json.content || '';
      fileContent = json.fileContent || '';
    }

    if (!content && !fileContent) {
      throw new Error('Conteúdo ou arquivo é obrigatório');
    }

    const prompt = fileContent ? 
      `Analise o seguinte documento:\n${fileContent}\n\n${content ? `Considerando o conteúdo acima, responda: ${content}` : 'Por favor, analise este documento e substitua os dados das partes pelos parâmetros dinâmicos conforme as instruções do sistema.'}` : 
      content;

    console.log('Enviando requisição para o Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Resposta recebida do Gemini API:', text);

    // Remove blocos de código se presentes
    const cleanText = text.replace(/```(?:.*\n)?([\s\S]*?)```/g, '$1').trim();
    
    return new Response(
      JSON.stringify({ 
        text: cleanText,
        fileProcessed: !!fileContent
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
