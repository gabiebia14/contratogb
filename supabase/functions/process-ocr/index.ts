import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json();

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 1,
        maxOutputTokens: 8192,
      }
    });

    // Create a dynamic prompt based on document type
    const rolePrompt = `Você é um assistente especializado em extrair dados de documentos para contratos de locação. 
    Analisando o documento fornecido para um ${documentType.toUpperCase()}, 
    estado civil ${maritalStatus.toUpperCase()}, 
    ${sharedAddress ? 'com endereço compartilhado com cônjuge' : 'sem endereço compartilhado'}.
    
    Extraia APENAS os dados que você encontrar no documento, deixando como null os campos não encontrados.
    Retorne os dados em formato JSON usando exatamente a estrutura abaixo, dependendo do tipo de documento:
    
    ${documentType === 'locador' ? `{
      "locador_nome": string | null,
      "locador_nacionalidade": string | null,
      "locador_estado_civil": string | null,
      "locador_profissao": string | null,
      "locador_rg": string | null,
      "locador_cpf": string | null,
      "locador_endereco": string | null,
      "locador_bairro": string | null,
      "locador_cep": string | null,
      "locador_cidade": string | null,
      "locador_estado": string | null
    }` : documentType === 'locatario' ? `{
      "locatario_nome": string | null,
      "locatario_nacionalidade": string | null,
      "locatario_estado_civil": string | null,
      "locatario_profissao": string | null,
      "locatario_rg": string | null,
      "locatario_cpf": string | null,
      "locatario_endereco": string | null,
      "locatario_bairro": string | null,
      "locatario_cep": string | null,
      "locatario_cidade": string | null,
      "locatario_estado": string | null,
      "locatario_telefone": string | null
    }` : `{
      "fiador_nome": string | null,
      "fiador_nacionalidade": string | null,
      "fiador_estado_civil": string | null,
      "fiador_profissao": string | null,
      "fiador_rg": string | null,
      "fiador_cpf": string | null,
      "fiador_endereco": string | null,
      "fiador_bairro": string | null,
      "fiador_cep": string | null,
      "fiador_cidade": string | null,
      "fiador_estado": string | null,
      "fiador_telefone": string | null
    }`}
    
    IMPORTANTE:
    - Retorne APENAS o JSON, sem nenhum texto adicional
    - Use null para campos não encontrados
    - Mantenha os nomes dos campos exatamente como mostrado
    - Não inclua campos adicionais
    - Não inclua comentários ou explicações
    - Extraia apenas os dados visíveis no documento`;

    console.log('Processing document with Gemini API...');
    
    // Remove the data:image/[type];base64, prefix from the base64 string
    const base64Data = base64Image.split(',')[1];
    
    // Call Gemini API with the image
    const result = await model.generateContent([
      rolePrompt,
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

    // Clean up the response by removing markdown code blocks if present
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    
    // Process the extracted data
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
      
      // Convert the extracted data to the format expected by the frontend
      const formattedData = Object.entries(extractedData).map(([field, value]) => ({
        field: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value || 'Não encontrado',
        confidence: value ? 0.95 : 0.1
      }));

      return new Response(
        JSON.stringify({ success: true, data: formattedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Falha ao processar documento',
          details: error.message,
          rawResponse: text
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});