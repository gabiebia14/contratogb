
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import mammoth from 'https://esm.sh/mammoth@1.6.0'
import * as pdfjs from 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.min.js'

console.log("Edge Function Version: 1.0.3");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400'
}

serve(async (req: Request) => {
  console.log("Received request:", req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    console.log("Processing request body");
    let body;
    try {
      const text = await req.text();
      console.log("Raw request body:", text);
      body = JSON.parse(text);
      console.log("Parsed JSON successfully:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error('Invalid JSON in request body');
    }
    
    const { fileName, fileType, fileContent } = body;
    
    if (!fileName || !fileType || !fileContent) {
      console.error("Missing required fields:", { fileName: !!fileName, fileType: !!fileType, fileContent: !!fileContent });
      throw new Error('Dados incompletos');
    }

    console.log("Processing file:", fileName, "Type:", fileType);

    let buffer;
    try {
      buffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0)).buffer;
      console.log("Buffer created successfully, size:", buffer.byteLength);
    } catch (e) {
      console.error("Error creating buffer from base64:", e);
      throw new Error('Error decoding base64 content');
    }

    let content = '';

    if (fileType.includes('word') || fileType.includes('openxmlformats')) {
      console.log("Processing Word document");
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      content = result.value;
    } else if (fileType.includes('pdf')) {
      console.log("Processing PDF document");
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        const numPages = pdf.numPages;
        console.log("PDF pages:", numPages);
        const textContent = [];

        for (let i = 1; i <= numPages; i++) {
          console.log("Processing page", i);
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          const pageText = text.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ');
          textContent.push(pageText);
        }

        content = textContent.join('\n');
        await pdf.destroy();
      } catch (pdfError) {
        console.error('Erro detalhado ao processar PDF:', pdfError);
        throw new Error('Erro ao processar arquivo PDF: ' + pdfError.message);
      }
    } else {
      console.error("Unsupported file type:", fileType);
      throw new Error('Formato de arquivo não suportado. Use PDF ou Word.');
    }

    if (!content.trim()) {
      console.error("No content extracted");
      throw new Error('Nenhum texto extraído do arquivo');
    }

    console.log("Successfully processed file. Content length:", content.length);

    return new Response(
      JSON.stringify({ content }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    
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
    );
  }
});
