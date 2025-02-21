
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from 'npm:@gradio/client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    console.log('Iniciando conexão com o Qwen...');
    
    const client = await Client.connect("Qwen/Qwen2.5-Turbo-1M-Demo");
    
    console.log('Enviando texto para análise...');

    const prompt = `Analise o seguinte contrato como um especialista jurídico:

${texto}

Por favor, forneça uma análise detalhada incluindo:
1. Principais cláusulas e suas implicações
2. Possíveis riscos ou pontos de atenção
3. Sugestões de melhorias
4. Conformidade com a legislação vigente
5. Recomendações gerais

Responda de forma clara e estruturada.`;

    const result = await client.predict("/add_text", { 		
      _input: { text: prompt, files: [] }, 		
      _chatbot: [] 
    });

    console.log('Resposta recebida do Qwen:', JSON.stringify(result));

    if (!result?.data) {
      console.error('Resposta vazia do modelo:', result);
      throw new Error('O modelo não retornou uma resposta válida');
    }

    // Trata os diferentes formatos possíveis de resposta
    let análise = '';
    if (Array.isArray(result.data) && result.data[1]?.[0]?.[1]?.text) {
      análise = result.data[1][0][1].text;
    } else if (typeof result.data === 'string') {
      análise = result.data;
    } else if (typeof result.data === 'object' && 'text' in result.data) {
      análise = result.data.text;
    } else {
      console.error('Estrutura da resposta:', result.data);
      throw new Error('Formato de resposta inesperado do modelo');
    }

    if (!análise) {
      throw new Error('Não foi possível extrair o texto da análise');
    }

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
