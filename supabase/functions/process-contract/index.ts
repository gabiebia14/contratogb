
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
        maxOutputTokens: 8192,
      }
    });

    let prompt = '';
    if (file) {
      const fileContent = await file.text();
      prompt = `Analise o seguinte documento:
Nome do arquivo: ${file.name}
Conteúdo do arquivo:
${fileContent}

${content ? `Considerando o conteúdo acima, responda: ${content}` : 'Por favor, analise este documento e forneça um resumo detalhado, destacando os pontos principais e quaisquer questões importantes que precisem de atenção.'}`;
    } else {
      prompt = content;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
