
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as mammoth from 'npm:mammoth@1.6.0'
import * as pdfjs from 'npm:pdfjs-dist@4.0.379/build/pdf.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    const { fileName, fileType, fileContent } = await req.json()

    if (!fileContent) {
      throw new Error('No file content provided')
    }

    console.log('Received file:', fileName, 'Type:', fileType)
    console.log('Content length:', fileContent.length)

    // Remove data URL prefix if present
    const base64Content = fileContent.includes('base64,') 
      ? fileContent.split('base64,')[1] 
      : fileContent

    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0))
    console.log('Binary data length:', binaryData.length)

    let content = ''
    
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Processing DOCX file...')
      try {
        const result = await mammoth.extractRawText({ 
          buffer: binaryData.buffer 
        })
        console.log('Extraction successful')
        content = result.value
      } catch (extractError) {
        console.error('Mammoth extraction error:', extractError)
        throw new Error(`Error extracting text from DOCX: ${extractError.message}`)
      }
    } else if (fileType === 'application/pdf') {
      console.log('Processing PDF file...')
      try {
        // Load the PDF document
        const loadingTask = pdfjs.getDocument({ data: binaryData })
        const pdf = await loadingTask.promise
        console.log('PDF loaded successfully, pages:', pdf.numPages)

        // Extract text from all pages
        const textContent = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const text = await page.getTextContent()
          const pageText = text.items
            .map((item: any) => item.str)
            .join(' ')
          textContent.push(pageText)
        }
        
        content = textContent.join('\n\n')
        console.log('PDF text extraction successful')
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError)
        throw new Error(`Error extracting text from PDF: ${pdfError.message}`)
      }
    } else {
      throw new Error('Unsupported file type: ' + fileType)
    }

    if (!content) {
      throw new Error('No content extracted from file')
    }

    console.log('Extracted content length:', content.length)
    
    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
