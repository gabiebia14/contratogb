
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mammoth from 'https://esm.sh/mammoth@1.6.0'
import * as pdfjs from 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.min.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // Parse request body
    const { fileName, fileType, fileContent } = await req.json();
    
    if (!fileName || !fileType || !fileContent) {
      throw new Error('Dados incompletos');
    }

    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)).buffer;

    let content = '';

    if (fileType.includes('word') || fileType.includes('openxmlformats')) {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      content = result.value
    } else if (fileType.includes('pdf')) {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

        const pdf = await pdfjs.getDocument({ data: buffer }).promise
        const numPages = pdf.numPages
        const textContent = []

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const text = await page.getTextContent()
          const pageText = text.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ')
          textContent.push(pageText)
        }

        content = textContent.join('\n')
        await pdf.destroy()
      } catch (pdfError) {
        console.error('Erro detalhado ao processar PDF:', pdfError)
        throw new Error('Erro ao processar arquivo PDF: ' + pdfError.message)
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
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo'
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
