import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json();
    
    console.log('Processando documento do tipo:', documentType);
    console.log('Estado civil recebido:', maritalStatus);
    console.log('Endereço compartilhado:', sharedAddress);

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

    console.log('Processando documento com API Gemini...');
    
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    if (!base64Data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados da imagem em base64 são obrigatórios'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Prompt específico baseado no tipo de documento
      const prompt = documentType === 'comprovante_endereco' 
        ? `Extraia do comprovante de endereço as seguintes informações em formato JSON:
           endereco, bairro, cep, cidade, estado.
           Retorne apenas os campos encontrados, em formato JSON puro sem markdown.`
        : `Extraia do documento pessoal as seguintes informações em formato JSON:
           ${documentType}_nome,
           ${documentType}_nacionalidade,
           ${documentType}_estado_civil,
           ${documentType}_profissao,
           ${documentType}_rg,
           ${documentType}_cpf,
           ${documentType}_endereco,
           ${documentType}_bairro,
           ${documentType}_cep,
           ${documentType}_cidade,
           ${documentType}_estado,
           ${documentType}_telefone.
           Retorne apenas os campos encontrados, em formato JSON puro sem markdown.
           Se encontrar mais de um RG ou CPF, inclua todos.
           Mantenha o prefixo "${documentType}_" em todos os campos.
           Procure por datas no formato DD/MM/YYYY.`;

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
        throw new Error('Sem resposta da API Gemini');
      }

      const response = result.response;
      const text = response.text();
      
      console.log('Resposta bruta do Gemini:', text);

      try {
        // Remove blocos de código markdown se presentes
        const cleanText = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                             .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
                             .trim();
        
        console.log('Texto limpo:', cleanText);
        
        const extractedData = JSON.parse(cleanText);
        console.log('Dados parseados:', extractedData);

        // Adiciona data e hora atual
        extractedData.data_processamento = new Date().toISOString();

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
        console.error('Erro ao processar JSON:', parseError);
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
      console.error('Erro detalhado do Gemini:', geminiError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao processar com API Gemini',
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
    console.error('Erro ao processar documento:', error);
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
});Z
