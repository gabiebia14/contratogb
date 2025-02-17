
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as handlebars from 'https://esm.sh/handlebars@4.7.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { templateId, documentId, title } = await req.json()

    if (!templateId || !documentId || !title) {
      throw new Error('Dados incompletos')
    }

    console.log('Iniciando geração de contrato:', { templateId, documentId, title });

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

    if (templateError) {
      console.error('Erro ao buscar template:', templateError);
      throw templateError;
    }

    if (!template) {
      throw new Error('Template não encontrado');
    }

    console.log('Template encontrado:', template.name);

    // Get document data
    const { data: document, error: documentError } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (documentError) {
      console.error('Erro ao buscar documento:', documentError);
      throw documentError;
    }

    if (!document) {
      throw new Error('Documento não encontrado');
    }

    console.log('Documento encontrado, processando dados extraídos');

    // Parse the extracted data
    const extractedData = typeof document.extracted_data === 'string' 
      ? JSON.parse(document.extracted_data)
      : document.extracted_data;

    console.log('Dados extraídos:', extractedData);

    // Compile template with Handlebars
    const compiledTemplate = handlebars.compile(template.content);
    const content = compiledTemplate(extractedData);

    console.log('Conteúdo do contrato gerado com sucesso');

    // Get current user
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('Usuário não autenticado');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError);
      throw new Error('Usuário não encontrado');
    }

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
        version: 1,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (contractError) {
      console.error('Erro ao criar contrato:', contractError);
      throw contractError;
    }

    console.log('Contrato criado com sucesso:', contract.id);

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
    console.error('Erro na geração do contrato:', error);
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
