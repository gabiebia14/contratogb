
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contrato1, contrato2 } = await req.json();

    if (!contrato1 || !contrato2) {
      throw new Error('Ambos os contratos são necessários para comparação');
    }

    const prompt = `Como um especialista em direito brasileiro, analise e compare os dois contratos a seguir:

Contrato 1:
${contrato1}

Contrato 2:
${contrato2}

Por favor, forneça uma análise detalhada focando nos seguintes aspectos:
1. Principais diferenças entre os contratos
2. Cláusulas presentes em um contrato mas ausentes no outro
3. Diferenças significativas em termos e condições
4. Possíveis implicações legais das diferenças encontradas
5. Recomendações para harmonização dos contratos, se necessário

Organize sua resposta em tópicos claros e objetivos.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em direito brasileiro, especializado em análise e comparação de contratos.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao processar a comparação');
    }

    const data = await response.json();
    const análise = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ análise }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
