
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InfoForm } from './components/InfoForm';
import { Questionnaire } from './components/Questionnaire';
import { ResultView } from './components/ResultView';
import { AppState, UserData } from './types';
import { fetchQuestionsSync, analyzeResults } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: 'welcome',
    userData: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    result: null,
    error: null,
  });

  const handleStart = () => setState(prev => ({ ...prev, step: 'info' }));

  const handleInfoSubmit = (userData: UserData) => {
    try {
      const questions = fetchQuestionsSync(userData);
      setState(prev => ({ 
        ...prev, 
        userData, 
        questions, 
        step: 'testing', 
        currentQuestionIndex: 0,
        error: null 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Ошибка при загрузке базы вопросов." }));
    }
  };

  const handleAnswer = (answer: string) => {
    const nextIndex = state.currentQuestionIndex + 1;
    const currentQuestionId = state.questions[state.currentQuestionIndex].id;
    const newAnswers = { ...state.answers, [currentQuestionId]: answer };

    if (nextIndex < state.questions.length) {
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex
      }));
    } else {
      handleFinalize(newAnswers);
    }
  };

  const handleFinalize = async (finalAnswers: Record<number, string>) => {
    setState(prev => ({ ...prev, step: 'analyzing', answers: finalAnswers, error: null }));
    try {
      if (state.userData) {
        const result = await analyzeResults(state.userData, state.questions, finalAnswers);
        setState(prev => ({ ...prev, result, step: 'result' }));
      }
    } catch (err: any) {
      console.error("Assessment error:", err);
      setState(prev => ({ 
        ...prev, 
        step: 'testing', 
        error: `ОШИБКА АНАЛИЗА: ${err?.message || "Проверьте API_KEY в настройках окружения."}` 
      }));
    }
  };

  return (
    <Layout>
      {state.error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[11px] rounded-xl text-center border border-red-100 font-medium">
          <p className="uppercase tracking-widest mb-1">Упс! Что-то пошло не так</p>
          <p className="opacity-70">{state.error}</p>
        </div>
      )}

      {state.step === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {state.step === 'info' && <InfoForm onSubmit={handleInfoSubmit} />}
      {state.step === 'testing' && state.questions.length > 0 && (
        <Questionnaire
          question={state.questions[state.currentQuestionIndex]}
          currentIndex={state.currentQuestionIndex}
          total={state.questions.length}
          onAnswer={handleAnswer}
        />
      )}
      {state.step === 'analyzing' && (
        <div className="text-center py-20 space-y-8 animate-pulse">
          <div className="w-12 h-12 border-t-2 border-gray-900 rounded-full animate-spin mx-auto opacity-30" />
          <div className="space-y-3">
            <h3 className="text-sm font-light text-gray-800 uppercase tracking-widest">Проводим глубокий анализ</h3>
            <p className="text-[10px] text-gray-400 max-w-[240px] mx-auto leading-relaxed">
              Обрабатываем ответы с использованием нейросетевых моделей Gemini и клинических баз данных
            </p>
          </div>
        </div>
      )}
      {state.step === 'result' && state.result && state.userData && (
        <ResultView result={state.result} userData={state.userData} />
      )}
    </Layout>
  );
};

export default App;
