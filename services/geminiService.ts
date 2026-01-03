
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
  
  // Вызываем наш собственный API на Vercel
  const response = await fetch('/api/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyze',
      userData,
      questions,
      answers
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Ошибка при анализе");
  }

  return await response.json();
};
