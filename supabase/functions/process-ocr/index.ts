import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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

    // Initialize Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Updated to use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Create system prompt based on document type
    const prompt = `Você é um assistente especialista na extração e organização de dados para a geração automatizada de contratos. Sua tarefa é extrair informações relevantes do documento fornecido para um ${documentType}. O estado civil da pessoa é ${maritalStatus} e ${sharedAddress ? 'compartilha endereço com cônjuge' : 'possui endereço diferente do cônjuge'}.

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

    console.log('Calling Gemini API...');

    // Remove the data:image/[type];base64, prefix from the base64 string
    const base64Data = base64Image.split(',')[1];
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Call Gemini API with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response:', text);

    // Process the extracted data
    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      extractedData = {
        error: 'Falha ao analisar dados extraídos',
        rawText: text
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