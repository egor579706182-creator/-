
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserData, AssessmentResult } from "../types";
import { getLocalQuestions } from "../data/questions";

/**
 * Инициализирует экземпляр AI. 
 * Используем блок try-catch или проверку, чтобы избежать ReferenceError на Vercel,
 * если процесс не полифиллится автоматически.
 */
const createAIInstance = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not defined in environment variables");
    }
    return new GoogleGenAI({ apiKey: apiKey || "" });
  } catch (e) {
    console.error("Critical error accessing process.env.API_KEY:", e);
    return null;
  }
};

export const fetchQuestionsSync = (userData: UserData): Question[] => {
  return getLocalQuestions(userData.age);
};

export const analyzeResults = async (
  userData: UserData, 
  questions: Question[], 
  answers: Record<number, string>
): Promise<AssessmentResult> => {
  const ai = createAIInstance();
  if (!ai) throw new Error("AI initialization failed");
  
  const formattedAnswers = questions.map(q => `Вопрос: ${q.text} | Ответ: ${answers[q.id]}`).join("\n");

  const prompt = `Проведи экспертную клиническую оценку коммуникативного развития ребенка.
  Данные пациента: возраст ${userData.age} лет, пол ${userData.gender}.
  Результаты тестирования:
  ${formattedAnswers}

  Твоя задача: Составить профессиональное заключение для родителей и специалистов.
  - Подробный анализ текущего уровня (речь, социальное взаимодействие, невербалика).
  - 7 конкретных, научно-обоснованных рекомендаций для занятий дома и со специалистами.
  - Долгосрочный прогноз развития.
  - Научный контекст на основе мировых стандартов (ICD-11 / DSM-5).

  Требования к оформлению:
  - НЕ используй жирное выделение (никаких **).
  - Язык: Русский.
  - Стиль: Строгий, клинический, но поддерживающий.
  - Формат ответа: Только чистый JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
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

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text);
};
