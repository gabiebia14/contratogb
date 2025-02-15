
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
    const { fileContent, fileType } = await req.json()

    if (!fileContent) {
      throw new Error('No file content provided')
    }

    const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0))

    let content = ''
    
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: binaryData.buffer })
      content = result.value
    } else {
      throw new Error('Unsupported file type')
    }

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
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
