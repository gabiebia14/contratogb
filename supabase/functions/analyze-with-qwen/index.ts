
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

if (!HF_TOKEN) {
  console.error('HUGGING_FACE_ACCESS_TOKEN não está configurado');
}

const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";

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
    if (fileType === 'application/pdf') {
      // Para PDFs, por enquanto retornamos o texto bruto
      text = await file.text();
    } else {
      // Para arquivos de texto
      text = await file.text();
    }

    // Remove caracteres não imprimíveis e normaliza espaços
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
    console.log('HF Token presente:', !!HF_TOKEN);

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
    console.log('Tamanho do texto após truncamento:', textoTruncado.length);

    const prompt = `<s>[INST] Você é um especialista jurídico brasileiro. Por favor, analise CUIDADOSAMENTE o seguinte contrato e forneça uma análise detalhada. O texto a ser analisado é:

${textoTruncado}

Sua análise deve incluir ESPECIFICAMENTE:
1. Identificação do tipo de contrato e partes envolvidas
2. Análise das principais cláusulas e obrigações
3. Pontos críticos e riscos jurídicos identificados
4. Sugestões específicas de melhorias ou ajustes necessários
5. Avaliação da conformidade legal e recomendações práticas

Importante: Baseie sua análise APENAS no conteúdo do contrato fornecido, sem fazer suposições. [/INST]</s>`;

    console.log('Enviando solicitação para o modelo...');

    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3, // Reduzido para respostas mais focadas
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
    console.log('Resposta recebida do modelo');

    if (!result || !Array.isArray(result) || !result[0]?.generated_text) {
      console.error('Formato inesperado:', result);
      throw new Error('Formato de resposta inválido do modelo');
    }

    let análise = result[0].generated_text.trim();
    
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
