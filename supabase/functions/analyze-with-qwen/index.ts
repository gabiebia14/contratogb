import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

if (!HF_TOKEN) {
  console.error('HUGGING_FACE_ACCESS_TOKEN não está configurado');
}

// Usando um modelo mais estável e testado do Hugging Face
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let texto = '';
    const contentType = req.headers.get('content-type') || '';

    console.log('Content-Type recebido:', contentType);
    console.log('HF Token presente:', !!HF_TOKEN);

    // Handle form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file) {
          throw new Error('Nenhum arquivo foi enviado');
        }

        console.log('Arquivo recebido:', file.name, 'Tipo:', file.type);

        const fileContent = await file.text();
        if (!fileContent) {
          throw new Error('Não foi possível ler o conteúdo do arquivo');
        }

        texto = fileContent;
        console.log('Tamanho do texto extraído:', texto.length);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        throw new Error(`Erro ao processar arquivo: ${error.message}`);
      }
    } else {
      // Handle JSON data (text input)
      try {
        const json = await req.json();
        texto = json.texto;
        console.log('Tamanho do texto recebido via JSON:', texto?.length);
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
        throw new Error(`Erro ao processar entrada de texto: ${error.message}`);
      }
    }

    if (!texto?.trim()) {
      throw new Error('O texto do contrato é necessário');
    }

    console.log('Iniciando análise com o Hugging Face...');

    const prompt = `<s>[INST] Você é um especialista jurídico brasileiro. Por favor, analise o seguinte contrato e forneça uma análise detalhada e estruturada:

${texto}

Sua análise deve incluir:
1. Principais cláusulas e suas implicações
2. Possíveis riscos ou pontos de atenção
3. Sugestões de melhorias
4. Conformidade com a legislação vigente
5. Recomendações gerais [/INST]</s>`;

    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        }
      }),
    });

    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', errorText);
      throw new Error(`Erro na API do Hugging Face: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Resposta recebida:', result);

    if (!result || !Array.isArray(result) || !result[0]?.generated_text) {
      console.error('Formato inesperado:', result);
      throw new Error('Formato de resposta inválido do modelo');
    }

    const análise = result[0].generated_text.trim();

    return new Response(
      JSON.stringify({ análise }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
