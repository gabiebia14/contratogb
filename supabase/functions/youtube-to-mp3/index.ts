
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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

    // Use pytube para baixar o áudio
    const command = new Deno.Command('python3', {
      args: [
        '-c',
        `
import sys
from pytube import YouTube

try:
    yt = YouTube('${url}')
    audio_stream = yt.streams.filter(only_audio=True).first()
    audio_data = audio_stream.download()
    print(f"SUCCESS:{audio_data}")
except Exception as e:
    print(f"ERROR:{str(e)}")
        `
      ]
    });

    const { code, stdout, stderr } = await command.output();
    const output = new TextDecoder().decode(stdout);

    if (code !== 0 || output.startsWith('ERROR:')) {
      throw new Error(output.replace('ERROR:', ''));
    }

    const audioPath = output.replace('SUCCESS:', '').trim();
    const audioData = await Deno.readFile(audioPath);

    // Limpar o arquivo temporário
    await Deno.remove(audioPath);

    return new Response(
      audioData,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="audio.mp3"'
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
