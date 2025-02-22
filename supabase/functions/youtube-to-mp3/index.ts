
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

    if (!url) {
      throw new Error('URL é obrigatória')
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeRegex.test(url)) {
      throw new Error('URL inválida do YouTube')
    }

    // Usar a API do YouTube para obter informações do vídeo
    const videoId = url.includes('youtu.be') 
      ? url.split('/').pop() 
      : new URL(url).searchParams.get('v');

    if (!videoId) {
      throw new Error('ID do vídeo não encontrado na URL');
    }

    // Usar um serviço público de conversão
    const converterUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
    
    const response = await fetch(converterUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': Deno.env.get('RAPID_API_KEY') || '',
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (data.status === 'fail') {
      throw new Error('Falha ao converter o vídeo');
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
    console.error('Erro na conversão:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
