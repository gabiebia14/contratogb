import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "@gradio/client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

if (!HF_TOKEN) {
  console.error('HUGGING_FACE_ACCESS_TOKEN não está configurado');
}

// Usando um modelo mais estável e testado do Hugging Face
const MODEL_URL = "Qwen/Qwen2.5-Turbo-1M-Demo";

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

    // Truncate the text if it exceeds the token limit
    const maxTokens = 32768 - 2048; // Adjust based on your max_new_tokens
    if (texto.length > maxTokens) {
      console.log(`Texto excede o limite de tokens. Truncando para ${maxTokens} tokens.`);
      texto = texto.slice(0, maxTokens);
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

    const client = await Client.connect(MODEL_URL);

    const result = await client.predict("/add_text", [
      { text: prompt, files: [] }, 
      []
    ]);

    console.log('Resposta recebida do Qwen');
    if (!result?.data?.[1]?.[0]?.[1]) {
      console.error('Resposta inesperada:', result);
      throw new Error('O modelo não conseguiu gerar uma análise válida. Por favor, tente novamente.');
    }

    const análise = result.data[1][0][1];
    if (typeof análise === 'string') {
      return new Response(
        JSON.stringify({ análise }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (typeof análise === 'object' && análise.text) {
      return new Response(
        JSON.stringify({ análise: análise.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Formato de resposta inesperado:', análise);
      throw new Error('Formato de resposta inesperado do modelo. Por favor, tente novamente.');
    }
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
