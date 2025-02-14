import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

console.log('Versão da função: 1.0.1'); // Altere este número a cada deploy

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json();
    
    console.log('Processing document with type:', documentType);
    console.log('Received marital status:', maritalStatus);
    console.log('Received shared address:', sharedAddress);

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GEMINI_API_KEY não configurada'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 1,
        maxOutputTokens: 4096,
      }
    });

    console.log('Processing document with Gemini API...');
    
    // Remove the data:image/[type];base64, prefix if it exists
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    if (!base64Data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Base64 image data is required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Create the prompt based on document type
      const prompt = documentType === 'comprovante_endereco' 
        ? 'Extraia do comprovante de endereço as seguintes informações em formato JSON: endereco, bairro, cep, cidade, estado. Retorne apenas os campos que encontrar, em formato JSON puro sem markdown.'
        : `Extraia do documento pessoal as seguintes informações em formato JSON: 
           nome_completo, rg, cpf, data_nascimento, nacionalidade, estado_civil, profissao, telefone. 
           Retorne apenas os campos que encontrar, em formato JSON puro sem markdown.
           Se encontrar um nome, mas não tiver certeza se é nome_completo, retorne como nome_completo mesmo assim.`;

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              },
              { text: prompt }
            ]
          }
        ]
      });

      if (!result.response) {
        throw new Error('No response from Gemini API');
      }

      const response = result.response;
      const text = response.text();
      
      console.log('Raw response from Gemini:', text);

      // Try to parse the response as JSON
      try {
        // Remove any markdown code blocks if present and clean up the text
        const cleanText = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                             .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
                             .trim();
        
        console.log('Cleaned text:', cleanText);
        
        const extractedData = JSON.parse(cleanText);
        console.log('Parsed data:', extractedData);

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: extractedData 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao processar resposta do modelo',
            details: parseError.message,
            rawResponse: text
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (geminiError) {
      console.error('Detailed Gemini error:', geminiError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error processing with Gemini API',
          details: geminiError.message,
          stack: geminiError.stack
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro ao processar documento',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
