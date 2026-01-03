
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserData, AssessmentResult } from "../types";
import { getLocalQuestions } from "../data/questions";

/**
 * Безопасно получаем API ключ, не вызывая ReferenceError в браузере.
 */
const getSafeApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // В некоторых средах обращение к process может быть заблокировано
  }
  return '';
};

export const fetchQuestionsSync = (userData: UserData): Question[] => {
  return getLocalQuestions(userData.age);
};

export const analyzeResults = async (
  userData: UserData, 
  questions: Question[], 
  answers: Record<number, string>
): Promise<AssessmentResult> => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey) {
    throw new Error("API_KEY не настроен. Пожалуйста, добавьте его в переменные окружения Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
    model: "gemini-2.0-flash-exp",
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
  if (!text) throw new Error("Пустой ответ от нейросети");
  return JSON.parse(text);
};
