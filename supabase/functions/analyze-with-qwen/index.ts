
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

        // Verifica se é um arquivo PDF
        if (file.type === 'application/pdf') {
          throw new Error('Arquivos PDF ainda não são suportados. Por favor, copie e cole o texto do contrato diretamente.');
        }

        // Verifica se é um arquivo de texto
        if (!file.type.includes('text/')) {
          throw new Error('Tipo de arquivo não suportado. Use apenas arquivos de texto (.txt).');
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
      _chatbot: [[{ text: prompt, files: [] }, { text: "", flushing: false }]]
    });

    console.log('Resposta recebida do Qwen:', JSON.stringify(result.data));

    if (!result?.data) {
      throw new Error('Resposta inválida do modelo');
    }

    // A resposta estará no segundo elemento do array e conterá o texto gerado
    const análise = result.data[1]?.[0]?.[1]?.text;

    if (!análise) {
      throw new Error('O modelo não retornou uma análise válida');
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
