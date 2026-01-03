
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { InfoForm } from './components/InfoForm';
import { Questionnaire } from './components/Questionnaire';
import { ResultView } from './components/ResultView';
import { AppState, UserData } from './types';
import { fetchQuestionsSync, analyzeResults } from './services/geminiService';

const CloudIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.007,0-0.013,0-0.019C11.385,13.805,10.71,14,10,14c-2.209,0-4-1.791-4-4 c0-2.198,1.779-3.98,3.974-4C10.457,3.523,12.553,2,15,2c3.314,0,6,2.686,6,6c0,0.117-0.003,0.233-0.01,0.349 C21.19,8.514,21.5,8.736,21.5,9c1.381,0,2.5,1.119,2.5,2.5S22.881,14,21.5,14c-0.126,0-0.248-0.009-0.367-0.027 C20.654,16.89,19.308,19,17.5,19z" />
  </svg>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<AppState>({
    step: 'welcome',
    userData: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    result: null,
    error: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  const handleStart = () => setState(prev => ({ ...prev, step: 'info', error: null }));

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
      setState(prev => ({ ...prev, error: "Не удалось загрузить базу вопросов." }));
    }
  };

  const handleAnswer = (answer: string) => {
    const nextIndex = state.currentQuestionIndex + 1;
    const currentQuestionIndex = state.currentQuestionIndex;
    const currentQuestionId = state.questions[currentQuestionIndex].id;
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
      console.error("Finalization error:", err);
      setState(prev => ({ 
        ...prev, 
        step: 'testing', 
        error: err?.message || "Произошла непредвиденная ошибка при анализе данных."
      }));
    }
  };

  return (
    <Layout>
      {state.error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[24px] text-red-700 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 opacity-60">Системное уведомление</p>
          <p className="text-sm font-light leading-relaxed">{state.error}</p>
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
        <div className="text-center py-20 space-y-16 animate-in fade-in duration-1000 relative overflow-hidden">
          {/* Контейнер для облаков */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <CloudIcon className="w-24 h-24 text-gray-400 absolute top-0 left-10 animate-cloud-slow" />
            <CloudIcon className="w-32 h-32 text-gray-500 absolute bottom-10 right-10 animate-cloud-medium" />
            <CloudIcon className="w-20 h-20 text-gray-400 absolute top-1/2 left-1/4 animate-cloud-fast" />
          </div>

          <div className="relative z-10 space-y-12">
            <div className="w-24 h-24 border-t-2 border-gray-900 rounded-full animate-spin mx-auto opacity-10" />
            
            <div className="space-y-4 px-4">
              <h3 className="text-xl font-light text-gray-900 tracking-tight">Идет глубокий экспертный анализ...</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-[400px] mx-auto">
                  Это может занять до 1-2 минут. Искусственный интеллект сопоставляет ответы с клиническими базами данных МКБ-11 и DSM-5.
                </p>
                <p className="text-[10px] text-gray-300 uppercase tracking-[0.3em]">
                  Пожалуйста, не закрывайте страницу
                </p>
              </div>
            </div>

            {/* Дополнительная визуальная индикация прогресса */}
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-1.5 h-1.5 rounded-full bg-gray-900 animate-bounce" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
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
