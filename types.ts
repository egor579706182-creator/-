
export enum Gender {
  MALE = 'Мальчик',
  FEMALE = 'Девочка'
}

export interface Question {
  id: number;
  text: string;
  options: string[]; // Exactly 5 one-word options
}

export interface UserData {
  age: number;
  gender: Gender;
}

export interface AssessmentResult {
  analysis: string;
  recommendations: string[];
  prognosis: string;
  scientificContext: string;
}

export interface AppState {
  step: 'welcome' | 'info' | 'testing' | 'analyzing' | 'result';
  userData: UserData | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  result: AssessmentResult | null;
  error: string | null;
}
