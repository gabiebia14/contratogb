
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as mammoth from 'npm:mammoth@1.6.0'

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
        throw new Error(`Error extracting text: ${extractError.message}`)
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
