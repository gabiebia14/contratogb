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
    const systemMessage = `You are an expert assistant in extracting and organizing data for automated contract generation. Your task is to extract relevant information from the provided document image for a ${documentType}. The person's marital status is ${maritalStatus} and ${sharedAddress ? 'shares address with spouse' : 'has a different address than spouse'}.

    Please extract the following information in a structured format:
    - Full Name
    - Nationality
    - Marital Status
    - Profession
    - RG (ID)
    - CPF (Tax ID)
    - Address
    - Neighborhood
    - ZIP Code
    - City
    - State
    - Phone Number (if available)

    Return the data in a JSON format using these exact field names.`;

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
                text: 'Please extract all relevant information from this document image.',
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
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
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
        error: 'Failed to parse extracted data',
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