
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
    const questions = fetchQuestionsSync(userData);
    setState(prev => ({ 
      ...prev, 
      userData, 
      questions, 
      step: 'testing', 
      currentQuestionIndex: 0,
      error: null 
    }));
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
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        step: 'testing', 
        error: 'ОШИБКА АНАЛИЗА. ПРОВЕРЬТЕ API КЛЮЧ В НАСТРОЙКАХ VERCEL.' 
      }));
    }
  };

  return (
    <Layout>
      {state.error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 text-[10px] rounded-xl text-center uppercase tracking-widest font-medium border border-red-100">
          {state.error}
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
        <div className="text-center py-20 space-y-6">
          <div className="w-10 h-10 border-t-2 border-gray-900 rounded-full animate-spin mx-auto opacity-20" />
        </div>
      )}
      {state.step === 'result' && state.result && state.userData && (
        <ResultView result={state.result} userData={state.userData} />
      )}
    </Layout>
  );
};

export default App;
