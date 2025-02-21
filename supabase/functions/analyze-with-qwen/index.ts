
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:@gradio/client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastParagraph = truncated.lastIndexOf('\n\n');
  
  if (lastParagraph === -1) {
    const lastSentence = truncated.lastIndexOf('.');
    return lastSentence === -1 ? truncated : truncated.substring(0, lastSentence + 1);
  }
  
  return truncated.substring(0, lastParagraph) + '\n\n[Texto truncado devido ao tamanho...]';
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  let text = '';

  try {
    text = await file.text();
    text = text.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
               .replace(/\s+/g, ' ')
               .trim();

    return text;
  } catch (error) {
    console.error('Erro ao extrair texto do arquivo:', error);
    throw new Error(`Não foi possível extrair o texto do arquivo: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let texto = '';
    const contentType = req.headers.get('content-type') || '';

    console.log('Content-Type recebido:', contentType);

    // Processar entrada (arquivo ou texto)
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
          throw new Error('Nenhum arquivo foi enviado');
        }

        console.log('Arquivo recebido:', file.name, 'Tipo:', file.type);
        texto = await extractTextFromFile(file);
        console.log('Texto extraído (primeiros 200 caracteres):', texto.substring(0, 200));
        
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        throw new Error(`Erro ao processar arquivo: ${error.message}`);
      }
    } else {
      try {
        const json = await req.json();
        texto = json.texto;
        console.log('Texto recebido via JSON (primeiros 200 caracteres):', texto?.substring(0, 200));
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
        throw new Error(`Erro ao processar entrada de texto: ${error.message}`);
      }
    }

    if (!texto?.trim()) {
      throw new Error('O texto do contrato é necessário');
    }

    const MAX_TEXT_LENGTH = 12000;
    const textoTruncado = truncateText(texto, MAX_TEXT_LENGTH);
    
    console.log('Conectando ao modelo Qwen...');
    const client = await Client.connect("Qwen/Qwen2.5-Turbo-1M-Demo");
    
    console.log('Enviando texto para análise...');
    const prompt = `Por favor, analise o seguinte contrato de maneira detalhada e profissional:

${textoTruncado}

Forneça uma análise completa incluindo:
1. Tipo de contrato e partes envolvidas
2. Principais cláusulas e obrigações
3. Pontos críticos e riscos jurídicos
4. Sugestões de melhorias
5. Conformidade legal`;

    // Primeira chamada: adicionar o texto
    const addTextResult = await client.predict(
      "/add_text",
      {
        _input: { text: prompt, files: [] },
        _chatbot: []
      }
    );

    // Segunda chamada: executar o agente
    const analysisResult = await client.predict(
      "/agent_run",
      {
        _chatbot: addTextResult[1] // Usa o resultado do chatbot da primeira chamada
      }
    );

    // Terceira chamada: finalizar
    await client.predict("/flushed");

    let análise = '';
    if (Array.isArray(analysisResult) && analysisResult.length > 0) {
      // Extrai o texto da resposta do modelo
      const lastMessage = analysisResult[analysisResult.length - 1];
      if (Array.isArray(lastMessage) && lastMessage[1] && typeof lastMessage[1].text === 'string') {
        análise = lastMessage[1].text.trim();
      }
    }

    if (!análise) {
      throw new Error('Não foi possível gerar a análise do contrato');
    }

    if (texto.length > MAX_TEXT_LENGTH) {
      análise = "⚠️ Nota: Devido ao tamanho do documento, apenas uma parte foi analisada.\n\n" + análise;
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
