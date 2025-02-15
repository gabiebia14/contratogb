
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mammoth from 'https://esm.sh/mammoth@1.6.0'
import { extract } from 'https://deno.land/x/pdf_extract@v0.2.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('Nenhum arquivo enviado')
    }

    let content = ''

    // Processar arquivo baseado no tipo
    if (file.type.includes('pdf')) {
      const pdfBuffer = await file.arrayBuffer()
      content = await extract(new Uint8Array(pdfBuffer))
    } else if (file.type.includes('word') || file.type.includes('openxmlformats')) {
      const buffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      content = result.value
    } else {
      throw new Error('Formato de arquivo não suportado')
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
