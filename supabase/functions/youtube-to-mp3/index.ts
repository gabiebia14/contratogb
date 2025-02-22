
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    console.log('URL recebida:', url);

    if (!url) {
      throw new Error('URL é obrigatória')
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeRegex.test(url)) {
      throw new Error('URL inválida do YouTube')
    }

    // Extrair ID do vídeo
    let videoId;
    try {
      if (url.includes('youtu.be')) {
        videoId = url.split('/').pop()?.split('?')[0];
      } else {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      }
    } catch (e) {
      console.error('Erro ao extrair ID do vídeo:', e);
      throw new Error('Não foi possível extrair o ID do vídeo da URL');
    }

    if (!videoId) {
      throw new Error('ID do vídeo não encontrado na URL');
    }

    console.log('ID do vídeo extraído:', videoId);

    // Verificar se a chave API está disponível
    const apiKey = Deno.env.get('RAPID_API_KEY');
    if (!apiKey) {
      throw new Error('Chave API não configurada');
    }

    // Usar o serviço de conversão
    const converterUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
    console.log('Fazendo requisição para:', converterUrl);
    
    const response = await fetch(converterUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    // Verificar status da resposta
    if (!response.ok) {
      console.error('Erro na resposta da API:', response.status, response.statusText);
      const text = await response.text();
      console.error('Corpo da resposta:', text);
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resposta da API:', data);

    if (!data || data.status === 'fail') {
      throw new Error(data.msg || 'Falha ao converter o vídeo');
    }

    if (!data.link) {
      throw new Error('Link de download não encontrado na resposta');
    }

    return new Response(
      JSON.stringify({ downloadUrl: data.link }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Erro completo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
