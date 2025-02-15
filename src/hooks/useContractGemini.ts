
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const useContractGemini = () => {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  const processContract = async (content: string) => {
    try {
      const result = await model.generateContent(content);
      const response = await result.response;
      const text = response.text();
      
      // Remove code blocks if present
      const cleanText = text.replace(/```(?:.*\n)?([\s\S]*?)```/g, '$1').trim();
      return cleanText;
    } catch (error) {
      console.error("Error processing contract with Gemini:", error);
      throw error;
    }
  };

  return { processContract };
};
