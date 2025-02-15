
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mammoth from 'https://esm.sh/mammoth@1.6.0'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
    const buffer = await file.arrayBuffer()

    if (file.type.includes('word') || file.type.includes('openxmlformats')) {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      content = result.value
    } else if (file.type.includes('pdf')) {
      try {
        const pdfDoc = await PDFDocument.load(buffer)
        const pages = pdfDoc.getPages()
        const texts = []
        
        for (const page of pages) {
          const text = await page.getTextContent()
          texts.push(text)
        }
        
        content = texts.join('\n')
      } catch (pdfError) {
        console.error('Erro ao processar PDF:', pdfError)
        throw new Error('Erro ao processar arquivo PDF. Por favor, tente converter para Word.')
      }
    } else {
      throw new Error('Formato de arquivo não suportado. Use PDF ou Word.')
    }

    if (!content.trim()) {
      throw new Error('Nenhum texto extraído do arquivo')
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
