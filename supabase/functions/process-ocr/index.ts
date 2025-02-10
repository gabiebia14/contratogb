import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai"
import { GoogleAIFileManager } from "@google/generative-ai/server"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentType, base64Image, maritalStatus, sharedAddress } = await req.json()
    
    console.log('Processing document with type:', documentType);

    const apiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: `Você é um assistente especialista na extração e organização de dados para a geração automatizada de contratos. Sua função é utilizar técnicas avançadas de OCR para processar documentos ou imagens carregadas, identificar as informações relevantes e organizá-las em parâmetros dinâmicos. Todas as informações e configurações serão definidas manualmente pelo usuário no dashboard.

Fluxo de Trabalho
1. Configurações do Documento:
No dashboard, o usuário configurará os seguintes campos para cada documento carregado:

Parte do Documento
Opções disponíveis:

Locatário
Locatária
Locador
Locadora
Fiador
Fiadora
Tipo de Documento
Opções disponíveis:
Documentos Pessoais
Comprovante de Endereço

2. Extração de Dados Baseada no Tipo de Documento
A extração de dados será limitada conforme o tipo de documento selecionado pelo usuário:

2.1. Se for Documentos Pessoais:
Extraia os seguintes parâmetros:
Nome Completo ({nome_completo}) ou ({locador_nome}) ou ({locatario_nome}) ou ({locataria_nome}) ou {fiador_nome} ou {fiadora_nome}
RG ({rg}) ou {locador_rg} ou {fiador_rg} ou {fiadora_rg}
CPF ({cpf}) ou {locatario_cpf} ou {locataria_cpf} ou {fiador_cpf} ou {fiadora_cpf}
Data de Nascimento ({data_nascimento})
- [Remover explicitamente qualquer menção de endereço aqui]
+ IMPORTANTE: Não extraia quaisquer informações de endereço, como logradouro, bairro, cidade, CEP ou estado
+ (mesmo que constem no documento RG/CNH). Apenas ignore esses dados.

2.2. Se for Comprovante de Endereço:
Extraia os seguintes parâmetros:
Endereço ({endereco})
Bairro ({bairro})
CEP ({cep})
Cidade ({cidade})
Estado ({estado})

3. Parâmetros Dinâmicos
Os dados extraídos devem ser organizados nos seguintes parâmetros:
LOCADOR(A):
Nome do Locador(a): {locador_nome}
Nacionalidade: {locador_nacionalidade}
Estado Civil: {locador_estado_civil}
Profissão: {locador_profissao}
RG: {locador_rg}
CPF: {locador_cpf}
Endereço: {locador_endereco}
Bairro: {locador_bairro}
CEP: {locador_cep}
Cidade: {locador_cidade}
Estado: {locador_estado}

LOCATÁRIO(A):
Nome: {locatario_nome} ou {locataria_nome}
Nacionalidade: {locatario_nacionalidade} ou {locataria_nacionalidade}
Estado Civil: {locatario_estado_civil} ou {locataria_estado_civil}
Profissão: {locatario_profissao} ou {locataria_profissao}
RG: {locatario_rg} ou {locataria_rg}
CPF: {locatario_cpf} ou {locataria_cpf}
Endereço: {locatario_endereco} ou {locataria_endereco}
Bairro: {locatario_bairro} ou {locataria_bairro}
CEP: {locatario_cep} ou {locataria_cep}
Cidade: {locatario_cidade} ou {locataria_cidade}
Estado: {locatario_estado} ou {locataria_estado}
Telefone: {locatario_telefone} ou {locataria_telefone}

FIADOR(A):
Nome: {fiador_nome} ou {fiadora_nome}
Nacionalidade: {fiador_nacionalidade} ou {fiadora_nacionalidade}
Estado Civil: {fiador_estado_civil} ou {fiadora_estado_civil}
Profissão: {fiador_profissao} ou {fiadora_profissao}
RG: {fiador_rg} ou {fiadora_rg}
CPF: {fiador_cpf} ou {fiadora_cpf}
Endereço: {fiador_endereco} ou {fiadora_endereco}
Bairro: {fiador_bairro} ou {fiadora_bairro}
CEP: {fiador_cep} ou {fiadora_cep}
Cidade: {fiador_cidade} ou {fiadora_cidade}
Estado: {fiador_estado} ou {fiadora_estado}
Telefone: {fiador_telefone} ou {fiadora_telefone}`,
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    console.log('Processing document with Gemini API...')
    
    // Remove the data:image/[type];base64, prefix from the base64 string
    const base64Data = base64Image.split(',')[1]

    // Upload image to Gemini
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: base64Data,
            },
          },
          { text: `Escolha: ${documentType}\n` },
        ],
      }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response:', text);

    // Process the extracted data
    try {
      const extractedData = JSON.parse(text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim())
      return new Response(
        JSON.stringify({ success: true, data: extractedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError)
      throw new Error('Failed to parse Gemini response as JSON')
    }
  } catch (error) {
    console.error('Error processing document:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'An error occurred while processing the document. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
