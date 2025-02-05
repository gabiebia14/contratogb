import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json();

    // Initialize OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create system message based on document type
    const systemMessage = `Você é um assistente especialista na extração e organização de dados para a geração automatizada de contratos. Sua tarefa é extrair informações relevantes do documento fornecido para um ${documentType}. O estado civil da pessoa é ${maritalStatus} e ${sharedAddress ? 'compartilha endereço com cônjuge' : 'possui endereço diferente do cônjuge'}.

    Por favor, extraia as seguintes informações em um formato estruturado:
    - Nome Completo (full_name)
    - Nacionalidade (nationality)
    - Estado Civil (marital_status)
    - Profissão (profession)
    - RG (rg)
    - CPF (cpf)
    - Endereço (address)
    - Bairro (neighborhood)
    - CEP (zip_code)
    - Cidade (city)
    - Estado (state)
    - Telefone (phone) (se disponível)

    Retorne os dados em formato JSON usando exatamente esses nomes de campos em inglês.`;

    console.log('Calling OpenAI API...');
    
    // Call OpenAI API with the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Por favor, extraia todas as informações relevantes desta imagem de documento.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('OpenAI Response:', data);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Erro desconhecido'}`);
    }

    // Process the extracted data
    const extractedText = data.choices[0].message.content;
    
    // Parse the JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      extractedData = {
        error: 'Falha ao analisar dados extraídos',
        rawText: extractedText
      };
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});