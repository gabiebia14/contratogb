
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateId, documentId, title, processedContent, documentData } = await req.json()

    // Criar cliente Supabase usando variáveis de ambiente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Processar o conteúdo substituindo as variáveis
    let finalContent = processedContent

    // Substituir todas as variáveis do template pelos dados do documento
    if (documentData) {
      Object.entries(documentData).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g')
        finalContent = finalContent.replace(regex, String(value))
      })
    }

    // Criar o contrato no banco de dados
    const { data: contract, error: insertError } = await supabaseClient
      .from('contracts')
      .insert({
        title,
        template_id: templateId,
        document_id: documentId,
        content: finalContent,
        status: 'draft',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating contract:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({
        contract
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
