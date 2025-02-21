
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
const MODEL_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen1.5-72B-Chat";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let texto = '';
    const contentType = req.headers.get('content-type') || '';

    console.log('Content-Type recebido:', contentType);

    // Handle form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file) {
          throw new Error('Nenhum arquivo foi enviado');
        }

        console.log('Arquivo recebido:', file.name, 'Tipo:', file.type);

        // Aceita tanto arquivos de texto quanto PDF
        if (!file.type.includes('text/') && !file.type.includes('application/pdf')) {
          throw new Error('Tipo de arquivo não suportado. Use arquivos de texto (.txt) ou PDF.');
        }

        // Lê o conteúdo do arquivo
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

    console.log('Iniciando análise...');

    const prompt = `<|im_start|>system
Você é um especialista jurídico que analisa contratos. Forneça uma análise detalhada, clara e estruturada do contrato apresentado.
<|im_end|>
<|im_start|>user
Analise o seguinte contrato como um especialista jurídico:

${texto}

Por favor, forneça uma análise detalhada incluindo:
1. Principais cláusulas e suas implicações
2. Possíveis riscos ou pontos de atenção
3. Sugestões de melhorias
4. Conformidade com a legislação vigente
5. Recomendações gerais
<|im_end|>
<|im_start|>assistant`;

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
          do_sample: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Hugging Face: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Resposta recebida:', result);

    if (!result || !Array.isArray(result) || !result[0]?.generated_text) {
      throw new Error('Formato de resposta inválido do modelo');
    }

    // Extrai apenas a parte da resposta após o último <|im_start|>assistant
    const fullResponse = result[0].generated_text;
    const análise = fullResponse.split('<|im_start|>assistant').pop() || '';

    return new Response(
      JSON.stringify({ análise: análise.trim() }),
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
