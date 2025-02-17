
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiting implementation
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Maximum requests per window
const requestTimes: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove requests older than the window
  while (requestTimes.length > 0 && requestTimes[0] < now - RATE_LIMIT_WINDOW) {
    requestTimes.shift();
  }
  // Check if we're over the limit
  if (requestTimes.length >= MAX_REQUESTS) {
    return true;
  }
  // Add current request
  requestTimes.push(now);
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Check rate limit
    if (isRateLimited()) {
      return new Response(
        JSON.stringify({
          error: 'Taxa limite excedida. Por favor, aguarde um momento antes de tentar novamente.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string;
    
    if (!content && !file) {
      throw new Error('Conteúdo ou arquivo é obrigatório');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096, // Reduced from 8192 to help with quota
      }
    });

    let prompt = '';
    if (file) {
      const fileContent = await file.text();
      // Limit file content size if needed
      const truncatedContent = fileContent.slice(0, 10000); // Limit to first 10k characters
      prompt = `Analise o seguinte documento:
Nome do arquivo: ${file.name}
Conteúdo do arquivo:
${truncatedContent}

${content ? `Considerando o conteúdo acima, responda: ${content}` : 'Por favor, analise este documento e forneça um resumo detalhado, destacando os pontos principais e quaisquer questões importantes que precisem de atenção.'}`;
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    
    // Handle specific API errors
    if (error.toString().includes('429')) {
      return new Response(
        JSON.stringify({
          error: 'O serviço está temporariamente indisponível devido ao alto volume de requisições. Por favor, tente novamente em alguns minutos.',
          code: 'QUOTA_EXCEEDED'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' }
        }
      );
    }

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
