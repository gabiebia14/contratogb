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
    const systemMessage = `You are an expert assistant in extracting and organizing data for automated contract generation. Your task is to extract relevant information from the provided document image for a ${documentType}. The person's marital status is ${maritalStatus} and ${sharedAddress ? 'shares address with spouse' : 'has a different address than spouse'}.`;

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
                text: 'Please extract all relevant information from this document image. Include name, nationality, marital status, profession, RG, CPF, address, neighborhood, ZIP code, city, state, and phone number if available.',
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

    // Process the extracted data
    const extractedText = data.choices[0].message.content;
    
    // Parse the extracted text into structured data
    // This is a simple example - you might want to enhance this parsing logic
    const extractedData = {
      name: extractText(extractedText, 'nome'),
      nationality: extractText(extractedText, 'nacionalidade'),
      maritalStatus: extractText(extractedText, 'estado civil'),
      profession: extractText(extractedText, 'profissão'),
      rg: extractText(extractedText, 'rg'),
      cpf: extractText(extractedText, 'cpf'),
      address: extractText(extractedText, 'endereço'),
      neighborhood: extractText(extractedText, 'bairro'),
      zipCode: extractText(extractedText, 'cep'),
      city: extractText(extractedText, 'cidade'),
      state: extractText(extractedText, 'estado'),
      phone: extractText(extractedText, 'telefone'),
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: extractedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing OCR:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to extract specific fields from the text
function extractText(text: string, field: string): string {
  const regex = new RegExp(`${field}[:\\s]+(.*?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}