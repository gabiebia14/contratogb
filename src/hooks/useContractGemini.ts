
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const useContractGemini = () => {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });

  const processContract = async (content: string) => {
    try {
      const chatSession = model.startChat({
        history: [],
      });

      const result = await chatSession.sendMessage([
        {
          text: content,
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
