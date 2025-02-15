
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0"

const apiKey = Deno.env.get('GEMINI_API_KEY')
if (!apiKey) throw new Error('GEMINI_API_KEY is required')

const genAI = new GoogleGenerativeAI(apiKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    const { content } = await req.json()

    if (!content) {
      throw new Error('Content is required')
    }

    console.log('Analyzing contract content length:', content.length)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
      systemInstruction: `You are an assistant specialized in automating and editing contract templates. Your function is to process uploaded templates, locate the Contracting Parties clause, and automatically replace existing data with previously defined dynamic parameters.

      Workflow
      1. Identify the Contracting Parties Clause:
      Locate the section of the contract that contains information about the parties involved, such as Landlord, Tenant, Guarantor.

      2. Replace with Dynamic Parameters:
      Replace fixed data found in the template with the dynamic parameter format.
      
      Dynamic Parameters Used:
      LOCADOR (Landlord)
      - {locador_nome}
      - {locador_nacionalidade}
      - {locador_estado_civil}
      - {locador_profissao}
      - {locador_rg}
      - {locador_cpf}
      - {locador_endereco}
      - {locador_bairro}
      - {locador_cep}
      - {locador_cidade}
      - {locador_estado}

      LOCATÁRIO(A) (Tenant)
      - {locatario_nome} or {locataria_nome}
      - {locatario_nacionalidade} or {locataria_nacionalidade}
      - {locatario_estado_civil} or {locataria_estado_civil}
      - {locatario_profissao} or {locataria_profissao}
      - {locatario_rg} or {locataria_rg}
      - {locatario_cpf} or {locataria_cpf}
      - {locatario_endereco} or {locataria_endereco}
      - {locatario_bairro} or {locataria_bairro}
      - {locatario_cep} or {locataria_cep}
      - {locatario_cidade} or {locataria_cidade}
      - {locatario_estado} or {locataria_estado}
      - {locatario_telefone} or {locataria_telefone}
      - {locatario_email} or {locataria_email}

      FIADOR(A) (Guarantor)
      - {fiador_nome} or {fiadora_nome}
      - {fiador_nacionalidade} or {fiadora_nacionalidade}
      - {fiador_estado_civil} or {fiadora_estado_civil}
      - {fiador_profissao} or {fiadora_profissao}
      - {fiador_rg} or {fiadora_rg}
      - {fiador_cpf} or {fiadora_cpf}
      - {fiador_endereco} or {fiadora_endereco}
      - {fiador_bairro} or {fiadora_bairro}
      - {fiador_cep} or {fiadora_cep}
      - {fiador_cidade} or {fiador_cidade}
      - {fiador_estado} or {fiador_estado}
      - {fiador_telefone} or {fiadora_telefone}
      - {fiador_email} or {fiadora_email}
      
      Always return a JSON object with two properties:
      1. text: the processed text with variables
      2. variables: an object mapping variable names to their labels in Portuguese
      `,
    })

    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const result = await chat.sendMessage(content)
    const response = result.response
    
    // Extract the text parts from the response
    const responseText = response.text()
    
    // Try to parse any JSON-like structure in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    let processedResponse = { text: '', variables: {} }
    
    if (jsonMatch) {
      try {
        processedResponse = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('Error parsing JSON from response:', e)
        // If JSON parsing fails, use the entire response as text
        processedResponse = {
          text: responseText,
          variables: {}
        }
      }
    } else {
      processedResponse = {
        text: responseText,
        variables: {}
      }
    }

    return new Response(
      JSON.stringify(processedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in analyze-contract function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
