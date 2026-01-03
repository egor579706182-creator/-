
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserData, AssessmentResult } from "../types";
import { getLocalQuestions } from "../data/questions";

// Функция получения ключа, поддерживающая оба варианта, необходимых пользователю
const getApiKey = (): string => {
  const key = process.env.API_KEY || (window as any).VITE_API_KEY || (window as any).process?.env?.API_KEY;
  if (!key) {
    console.warn("API Key not found in process.env or window.VITE_API_KEY");
  }
  return key || "";
};

export const fetchQuestionsSync = (userData: UserData): Question[] => {
  return getLocalQuestions(userData.age);
};

export const analyzeResults = async (
  userData: UserData, 
  questions: Question[], 
  answers: Record<number, string>
): Promise<AssessmentResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const formattedAnswers = questions.map(q => `Q: ${q.text} | A: ${answers[q.id]}`).join("\n");

  const prompt = `Clinical evaluation of child communication development.
  Patient: ${userData.age} years old, ${userData.gender}.
  Data:
  ${formattedAnswers}

  Task: Provide a high-level professional assessment.
  - Comprehensive analysis.
  - 7 actionable recommendations.
  - Long-term prognosis.
  - Scientific context (Global research standards).

  Requirements:
  - DO NOT use markdown bolding (no **).
  - Language: Russian.
  - Structure: Structured text for A4 report.
  - Output: JSON only.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          prognosis: { type: Type.STRING },
          scientificContext: { type: Type.STRING }
        },
        required: ["analysis", "recommendations", "prognosis", "scientificContext"]
      }
    }
  });

  return JSON.parse(response.text);
};
