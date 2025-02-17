
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as pdfjs from 'npm:pdfjs-dist@4.0.379/build/pdf.mjs'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file provided')
    }

    // Convert the file to array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
    const pdf = await loadingTask.promise

    // Get the first page
    const page = await pdf.getPage(1)
    
    // Set the scale for better quality
    const viewport = page.getViewport({ scale: 2.0 })
    
    // Prepare canvas
    const canvas = new OffscreenCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Could not get canvas context')
    }

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    // Convert canvas to blob
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.8
    })

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `covers/${crypto.randomUUID()}.jpg`
    const { error: uploadError, data } = await supabase.storage
      .from('library_pdfs')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL for the cover image
    const { data: { publicUrl } } = supabase.storage
      .from('library_pdfs')
      .getPublicUrl(fileName)

    return new Response(
      JSON.stringify({ coverImageUrl: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
