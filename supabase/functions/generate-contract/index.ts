
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateId, documentId, title, content } = await req.json()

    // Validações básicas
    if (!templateId || !documentId || !title || !content) {
      throw new Error('Dados incompletos para geração do contrato')
    }

    console.log('Dados recebidos:', { templateId, documentId, title, contentLength: content.length });

    // Criar cliente Supabase usando variáveis de ambiente
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando inserção do contrato...');

    // Primeiro, verificamos se o template e o documento existem
    const [templateCheck, documentCheck] = await Promise.all([
      supabaseAdmin.from('contract_templates').select('id').eq('id', templateId).single(),
      supabaseAdmin.from('processed_documents').select('id').eq('id', documentId).single()
    ]);

    if (templateCheck.error || !templateCheck.data) {
      throw new Error('Template não encontrado');
    }

    if (documentCheck.error || !documentCheck.data) {
      throw new Error('Documento não encontrado');
    }

    // Criar o contrato usando uma transação para garantir a consistência
    const { data: contract, error: insertError } = await supabaseAdmin
      .from('contracts')
      .insert({
        title,
        content,
        template_id: templateId,
        document_id: documentId,
        status: 'draft',
        generated_at: new Date().toISOString(),
        version: 1,
        variables: {},
        metadata: {
          source: 'generate-contract-function',
          timestamp: new Date().toISOString()
        }
      })
      .select('*')
      .single();

    if (insertError || !contract) {
      console.error('Erro ao inserir contrato:', insertError);
      throw new Error(`Erro ao salvar contrato: ${insertError?.message || 'Erro desconhecido'}`);
    }

    console.log('Contrato inserido com ID:', contract.id);

    // Aguarda um momento e então verifica se o contrato foi realmente salvo
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: verifiedContract, error: verifyError } = await supabaseAdmin
      .from('contracts')
      .select(`
        *,
        template:contract_templates(name),
        document:processed_documents(file_name)
      `)
      .eq('id', contract.id)
      .single();

    if (verifyError || !verifiedContract) {
      console.error('Erro ao verificar contrato:', verifyError);
      throw new Error('Contrato não foi persistido corretamente');
    }

    console.log('Contrato verificado e persistido com sucesso:', verifiedContract.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contrato gerado com sucesso',
        contract: verifiedContract
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro na função generate-contract:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Erro interno do servidor',
        error: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
