
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
      // Limit file content size
      const truncatedContent = fileContent.slice(0, 10000); // First 10k chars
      prompt = `Analise o seguinte documento:
Nome do arquivo: ${file.name}
Conteúdo do arquivo:
${truncatedContent}

${content ? `Considerando o conteúdo acima, responda: ${content}` : 'Por favor, analise este documento e forneça um resumo detalhado, destacando os pontos principais.'}`;
    } else {
      prompt = content;
    }

    console.log('Enviando requisição para o Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Resposta recebida do Gemini API');

    return new Response(
      JSON.stringify({ 
        text,
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
