
import React from 'react';
import { Question } from '../types';

interface QuestionnaireProps {
  question: Question;
  currentIndex: number;
  total: number;
  onAnswer: (answer: string) => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ 
  question, 
  currentIndex, 
  total, 
  onAnswer 
}) => {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs tracking-widest text-gray-400 uppercase">Вопрос {currentIndex + 1} из {total}</span>
          <span className="text-xs font-medium text-gray-900">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-900 transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-light text-gray-800 leading-tight">
          {question.text}
        </h3>

        <div className="flex flex-col space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(option)}
              className="w-full p-5 text-left rounded-2xl border border-gray-100 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all text-sm group flex items-center justify-between"
            >
              <span>{option}</span>
              <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-gray-900 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
