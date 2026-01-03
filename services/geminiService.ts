
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserData, AssessmentResult } from "../types";
import { getLocalQuestions } from "../data/questions";

export const fetchQuestionsSync = (userData: UserData): Question[] => {
  return getLocalQuestions(userData.age);
};

export const analyzeResults = async (
  userData: UserData, 
  questions: Question[], 
  answers: Record<number, string>
): Promise<AssessmentResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY не обнаружен. Пожалуйста, убедитесь, что ключ добавлен в Environment Variables вашего проекта на Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const formattedAnswers = questions.map(q => `Вопрос: ${q.text} | Ответ родителя: ${answers[q.id]}`).join("\n");

  const prompt = `Ты — ведущий мировой эксперт в области нейролингвистики и детской психопатологии. Твоя задача — провести глубокий клинический анализ коммуникативного развития ребенка.

  Данные пациента:
  - Возраст: ${userData.age} лет
  - Пол: ${userData.gender}
  
  Результаты детального тестирования (30 параметров):
  ${formattedAnswers}

  ИНСТРУКЦИИ ПО ФОРМИРОВАНИЮ ОТВЕТА:
  1. "analysis": Дай развернутый анализ. Оцени прагматику речи, социальное взаимодействие, когнитивные предпосылки и невербальные компоненты. Пиши строго, профессионально, БЕЗ грамматических и пунктуационных ошибок.
  2. "recommendations": Сформулируй 7 практических шагов. Они должны быть научно обоснованы (логопедические методики, сенсорная интеграция, поведенческая терапия).
  3. "prognosis": Составь прогноз на 2-3 года. Укажи возможные риски и зоны роста при условии коррекционной работы.
  4. "scientificContext": Опиши состояние в контексте современных классификаций (МКБ-11, раздел 6A02, или DSM-5).

  КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К ЯЗЫКУ:
  - Исключительно безупречный русский язык.
  - Никакой избыточной разметки (запрещено использование **, ##, __).
  - Ответ должен быть в формате JSON.
  - Текст должен быть связным, логичным и эмпатичным по отношению к родителям.`;

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
  if (!text) throw new Error("Модель не вернула данные. Попробуйте еще раз.");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parsing error:", text);
    throw new Error("Ошибка обработки данных. Пожалуйста, повторите попытку через минуту.");
  }
};
