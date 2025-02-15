
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { templateId, documentId, title } = await req.json()

    if (!templateId || !documentId || !title) {
      throw new Error('Dados incompletos')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw templateError

    // Get document data
    const { data: document, error: documentError } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (documentError) throw documentError

    // Replace variables in template
    let content = template.content
    const extractedData = document.extracted_data || {}
    const variables = template.template_variables || {}

    // Replace all variables in the content
    Object.entries(variables).forEach(([key, label]) => {
      const value = extractedData[key] || '[NÃO PREENCHIDO]'
      const regex = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(regex, value)
    })

    // Create contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        title,
        content,
        template_id: templateId,
        document_id: documentId,
        variables: extractedData,
        status: 'draft',
        version: 1
      })
      .select()
      .single()

    if (contractError) throw contractError

    return new Response(
      JSON.stringify({ contract }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
