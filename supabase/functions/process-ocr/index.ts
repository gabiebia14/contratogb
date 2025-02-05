import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json()

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })

    const systemInstruction = `Você é um assistente especialista na extração e organização de dados para a geração automatizada de contratos. Sua função é utilizar técnicas avançadas de OCR para processar documentos ou imagens carregadas, identificar as informações relevantes e organizá-las em parâmetros dinâmicos.

    Tipo de documento: ${documentType}
    Estado civil: ${maritalStatus}
    Endereço compartilhado com cônjuge: ${sharedAddress ? 'Sim' : 'Não'}

    Por favor, extraia e organize as seguintes informações no formato JSON:

    Para LOCADOR:
    - Nome ({locador_nome})
    - Nacionalidade ({locador_nacionalidade})
    - Estado Civil ({locador_estado_civil})
    - Profissão ({locador_profissao})
    - RG ({locador_rg})
    - CPF ({locador_cpf})
    - Endereço ({locador_endereco})
    - Bairro ({locador_bairro})
    - CEP ({locador_cep})
    - Cidade ({locador_cidade})
    - Estado ({locador_estado})

    Para LOCATÁRIO(A):
    - Nome ({locataria_nome} ou {locatario_nome})
    - Nacionalidade ({locataria_nacionalidade} ou {locatario_nacionalidade})
    - Estado Civil ({locataria_estado_civil} ou {locatario_estado_civil})
    - Profissão ({locataria_profissao} ou {locatario_profissao})
    - RG ({locataria_rg} ou {locatario_rg})
    - CPF ({locataria_cpf} ou {locatario_cpf})
    - Endereço ({locataria_endereco} ou {locatario_endereco})
    - Bairro ({locataria_bairro} ou {locatario_bairro})
    - CEP ({locataria_cep} ou {locatario_cep})
    - Cidade ({locataria_cidade} ou {locatario_cidade})
    - Estado ({locataria_estado} ou {locatario_estado})
    - Telefone ({locataria_telefone} ou {locatario_telefone})

    Para FIADOR(A):
    - Nome ({fiadora_nome} ou {fiador_nome})
    - Nacionalidade ({fiadora_nacionalidade} ou {fiador_nacionalidade})
    - Estado Civil ({fiadora_estado_civil} ou {fiador_estado_civil})
    - Profissão ({fiadora_profissao} ou {fiador_profissao})
    - RG ({fiadora_rg} ou {fiador_rg})
    - CPF ({fiadora_cpf} ou {fiador_cpf})
    - Endereço ({fiadora_endereco} ou {fiador_endereco})
    - Bairro ({fiadora_bairro} ou {fiador_bairro})
    - CEP ({fiadora_cep} ou {fiador_cep})
    - Cidade ({fiadora_cidade} ou {fiador_cidade})
    - Estado ({fiadora_estado} ou {fiador_estado})
    - Telefone ({fiadora_telefone} ou {fiador_telefone})

    Retorne os dados em formato JSON usando exatamente esses nomes de campos.
    Se alguma informação estiver faltando, indique com null.
    RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.`

    console.log('Processing document with Gemini API...')
    
    // Remove the data:image/[type];base64, prefix from the base64 string
    const base64Data = base64Image.split(',')[1]
    
    // Call Gemini API with the image
    const result = await model.generateContent([
      {
        text: systemInstruction
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    console.log('Gemini Response:', text)

    // Process the extracted data
    let extractedData
    try {
      extractedData = JSON.parse(text)
    } catch (error) {
      console.error('Error parsing Gemini response:', error)
      extractedData = {
        error: 'Falha ao analisar dados extraídos',
        rawText: text
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})