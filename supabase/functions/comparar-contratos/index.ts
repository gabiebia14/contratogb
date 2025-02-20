
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
    const { contrato1, contrato2 } = await req.json()

    if (!contrato1 || !contrato2) {
      throw new Error('Ambos os contratos são necessários para comparação')
    }

    const { pipeline } = await import("@huggingface/transformers")

    // Initialize the text generation pipeline with a smaller, faster model
    const generator = await pipeline(
      "text-generation",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      { device: "cpu" }
    )

    const prompt = `Analise e compare os dois contratos a seguir como um especialista jurídico:

Contrato 1:
${contrato1}

Contrato 2:
${contrato2}

Compare os seguintes aspectos:
1. Principais diferenças
2. Cláusulas presentes/ausentes
3. Termos e condições diferentes
4. Implicações legais
5. Recomendações

Responda de forma objetiva e estruturada.`

    const result = await generator(prompt, {
      max_length: 1000,
      temperature: 0.3,
      top_p: 0.95,
    })

    const análise = result[0].generated_text

    return new Response(
      JSON.stringify({ análise }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
