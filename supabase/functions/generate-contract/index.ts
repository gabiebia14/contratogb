
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
    const { templateId, documentId, title, content } = await req.json()

    // Criar cliente Supabase usando variáveis de ambiente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando inserção do contrato no banco...');

    // Criar o contrato no banco de dados
    const { data: contract, error: insertError } = await supabaseClient
      .from('contracts')
      .insert({
        title,
        template_id: templateId,
        document_id: documentId,
        content,
        status: 'draft',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating contract:', insertError)
      throw insertError
    }

    if (!contract) {
      throw new Error('Contrato não foi criado corretamente')
    }

    console.log('Contrato criado com sucesso:', contract.id);

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
