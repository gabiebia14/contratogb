
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const useContractGemini = () => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `Você é um assistente especialista em automação e edição de modelos de contrato. Sua função é processar modelos carregados, localizar a cláusula de Partes Contratantes, e substituir automaticamente os dados existentes pelos parâmetros dinâmicos previamente definidos.

Fluxo de Trabalho
Identificar a Cláusula de Partes Contratantes:
Localize a seção do contrato que contém informações sobre as partes envolvidas, como Locador, Locatária/Locatário, Fiador/Fiadora.

Substituir pelos Parâmetros Dinâmicos:
Substitua os dados fixos encontrados no modelo pelo formato de parâmetros dinâmicos.

Parâmetros Dinâmicos Utilizados:
LOCADOR (Landlord)
Nome do Locador: {locador_nome}
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

LOCATÁRIO(A) (Tenant)
Nome: {locataria_nome} ou {locatario_nome}
Nacionalidade: {locataria_nacionalidade} ou {locatario_nacionalidade}
Estado Civil: {locataria_estado_civil} ou {locatario_estado_civil}
Profissão: {locataria_profissao} ou {locatario_profissao}
RG: {locataria_rg} ou {locatario_rg}
CPF: {locataria_cpf} ou {locatario_cpf}
Endereço: {locataria_endereco} ou {locatario_endereco}
Bairro: {locataria_bairro} ou {locatario_bairro}
CEP: {locataria_cep} ou {locatario_cep}
Cidade: {locataria_cidade} ou {locatario_cidade}
Estado: {locataria_estado} ou {locatario_estado}
Telefone: {locataria_telefone} ou {locatario_telefone}
Email: {locataria_email} ou {locatario_email}

FIADOR(A) (Guarantor)
Nome: {fiadora_nome} ou {fiador_nome}
Nacionalidade: {fiadora_nacionalidade} ou {fiador_nacionalidade}
Estado Civil: {fiadora_estado_civil} ou {fiador_estado_civil}
Profissão: {fiadora_profissao} ou {fiador_profissao}
RG: {fiadora_rg} ou {fiador_rg}
CPF: {fiadora_cpf} ou {fiador_cpf}
Endereço: {fiadora_endereco} ou {fiador_endereco}
Bairro: {fiadora_bairro} ou {fiador_bairro}
CEP: {fiadora_cep} ou {fiador_cep}
Cidade: {fiadora_cidade} ou {fiador_cidade}
Estado: {fiadora_estado} ou {fiador_estado}
Telefone: {fiadora_telefone} ou {fiador_telefone}
Email: {fiadora_email} ou {fiador_email}`,
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const processContract = async (content: string) => {
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage([
        {
          text: `Por favor, processe o seguinte contrato e substitua a cláusula de partes pelos parâmetros dinâmicos:

${content}`,
        },
      ]);

      const processedText = result.response.text();
      console.log("Processed text:", processedText);

      // Se o Gemini retornar o texto dentro de marcadores de código, remova-os
      const cleanText = processedText.replace(/```(?:.*\n)?([\s\S]*?)```/g, '$1').trim();
      return cleanText;
    } catch (error) {
      console.error("Error processing contract with Gemini:", error);
      throw error;
    }
  };

  return { processContract };
};
