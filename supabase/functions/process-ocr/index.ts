
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-vision",
      systemInstruction: `Você é um assistente especialista na extração e organização de dados para a geração automatizada de contratos. Sua função é utilizar técnicas avançadas de OCR para processar documentos ou imagens carregadas, identificar as informações relevantes e organizá-las em parâmetros dinâmicos.

      Fluxo de Trabalho:
      Ao processar documentos, sempre retorne um objeto JSON com os seguintes campos (apenas os que forem encontrados):
      
      Para documentos pessoais (RG, CPF, CNH):
      - nome_completo
      - rg
      - cpf
      - data_nascimento
      
      Para comprovantes de endereço:
      - endereco
      - bairro
      - cep
      - cidade
      - estado
      
      IMPORTANTE: Retorne APENAS os dados encontrados na imagem, não invente ou adicione campos vazios.
      Retorne SEMPRE um objeto JSON válido.`,
    });

    const generationConfig = {
      temperature: 0.1,
      topP: 0.1,
      topK: 1,
      maxOutputTokens: 4096,
    };

    console.log('Processing document with Gemini API...');
    
    // Remove the data:image/[type];base64, prefix from the base64 string
    const base64Data = base64Image.split(',')[1];

    // Upload image to Gemini
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: base64Data,
            },
          },
          { text: `Por favor, extraia os dados deste documento para o papel de ${documentType}.` },
        ],
      }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response:', text);

    // Process the extracted data
    try {
      const extractedText = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
      console.log('Extracted text:', extractedText);
      
      const extractedData = JSON.parse(extractedText);
      console.log('Parsed data:', extractedData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: extractedData 
        }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao processar resposta do modelo',
          details: parseError.message
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
