
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mammoth from 'https://esm.sh/mammoth@1.6.0'
import * as pdfjs from 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.min.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      throw new Error('Método não permitido')
    }

    // Verificar content type
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error('Content-Type deve ser multipart/form-data')
    }

    // Processar form data
    let formData
    try {
      formData = await req.formData()
    } catch (formError) {
      console.error('Erro ao processar FormData:', formError)
      throw new Error('Erro ao processar dados do formulário')
    }

    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      throw new Error('Arquivo não encontrado no formulário')
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo 10MB permitido.')
    }

    let content = ''
    const buffer = await file.arrayBuffer()

    if (file.type.includes('word') || file.type.includes('openxmlformats')) {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer })
      content = result.value
    } else if (file.type.includes('pdf')) {
      try {
        // Inicializa o worker do PDF.js
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

        // Carrega o documento PDF
        const pdf = await pdfjs.getDocument({ data: buffer }).promise
        const numPages = pdf.numPages
        const textContent = []

        // Extrai o texto de cada página
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const text = await page.getTextContent()
          const pageText = text.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ')
          textContent.push(pageText)
        }

        content = textContent.join('\n')

        // Limpa o worker do PDF.js
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

    // Retorna o conteúdo processado
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
