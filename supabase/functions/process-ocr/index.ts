
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, documentType } = await req.json();

    if (!fileUrl) {
      throw new Error('No file URL provided');
    }

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file');
    }

    const fileBlob = await fileResponse.blob();
    const base64File = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(fileBlob);
    });

    // Process with OpenAI Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em extrair informações de documentos. 
                     Por favor, extraia as seguintes informações no formato JSON:
                     - Nome completo
                     - Nacionalidade
                     - Estado Civil
                     - Profissão
                     - RG
                     - CPF
                     - Endereço completo
                     - Bairro
                     - CEP
                     - Cidade
                     - Estado
                     - Telefone (se disponível)
                     
                     Formate cada campo com um objeto contendo "value" e "confidence" (0-1).
                     Se não encontrar alguma informação, retorne o campo com value null e confidence 0.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image_url: {
                  url: base64File as string
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to process document');
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;
    
    try {
      const parsedData = JSON.parse(extractedContent);
      return new Response(JSON.stringify(parsedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Failed to parse OpenAI response:', extractedContent);
      throw new Error('Failed to parse extracted data');
    }

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
