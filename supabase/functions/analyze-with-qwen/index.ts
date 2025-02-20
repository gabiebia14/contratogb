
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { texto } = await req.json()

    if (!texto) {
      throw new Error('O texto do contrato é necessário')
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Turbo-1M",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')}`,
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `Analise o seguinte contrato como um especialista jurídico:

${texto}

Por favor, forneça uma análise detalhada incluindo:
1. Principais cláusulas e suas implicações
2. Possíveis riscos ou pontos de atenção
3. Sugestões de melhorias
4. Conformidade com a legislação vigente
5. Recomendações gerais

Responda de forma clara e estruturada.`,
        }),
      }
    )

    const result = await response.json()

    return new Response(
      JSON.stringify({ análise: result[0].generated_text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
