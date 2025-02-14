
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      generationConfig: {
        temperature: 0,
        topP: 1,
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    try {
      const prompt = documentType === 'comprovante_endereco' 
        ? `Extraia do comprovante de endereço as seguintes informações em formato JSON:
           endereco, bairro, cep, cidade, estado.
           Retorne apenas os campos encontrados, em formato JSON puro sem markdown.`
        : `Extraia do documento pessoal as seguintes informações em formato JSON:
           ${documentType}_nome (nome completo),
           ${documentType}_nacionalidade,
           ${documentType}_estado_civil,
           ${documentType}_profissao,
           ${documentType}_rg (apenas números e pontuação se houver),
           ${documentType}_cpf (apenas números e pontuação se houver),
           ${documentType}_endereco (endereço completo),
           ${documentType}_bairro,
           ${documentType}_cep,
           ${documentType}_cidade,
           ${documentType}_estado (sigla do estado),
           ${documentType}_telefone.
           
           Instruções específicas:
           1. Mantenha o prefixo "${documentType}_" em todos os campos
           2. Retorne apenas campos que foram encontrados com certeza
           3. Para RG e CPF, retorne apenas os números e pontuação, sem texto adicional
           4. Para estado, use a sigla (ex: SP, RJ)
           5. Retorne em formato JSON puro sem markdown
           6. Não invente ou deduza informações, apenas extraia o que está visível
           7. Mantenha a formatação original de RG e CPF se houver (pontos e traços)`;

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
        const cleanText = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1')
                             .replace(/```\s*([\s\S]*?)\s*```/g, '$1')
                             .trim();
        
        console.log('Texto limpo:', cleanText);
        
        const extractedData = JSON.parse(cleanText);
        console.log('Dados parseados:', extractedData);

        // Adiciona data e hora atual em formato específico
        const now = new Date();
        extractedData.data_processamento = now.toISOString();

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: extractedData 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
