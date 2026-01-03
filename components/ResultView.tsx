
import React from 'react';
import { AssessmentResult, UserData } from '../types';

interface ResultViewProps {
  result: AssessmentResult;
  userData: UserData;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, userData }) => {
  const handleDownloadPDF = () => {
    // Basic browser print is cleaner for minimalist A4 styling in this environment
    window.print();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 print:m-0 print:p-0">
      <div className="space-y-2 border-b border-gray-100 pb-8 print:border-b-0">
        <h2 className="text-3xl font-extralight text-gray-900">Экспертное заключение</h2>
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Пациент: {userData.gender}, {userData.age} лет
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Анализ текущего состояния</h4>
          <p className="text-gray-600 font-light leading-relaxed text-sm whitespace-pre-wrap">
            {result.analysis}
          </p>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Рекомендации специалиста</h4>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-4 items-start text-sm text-gray-600 font-light leading-snug">
                <span className="text-gray-300">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Прогноз развития</h4>
          <p className="text-gray-600 font-light leading-relaxed text-sm">
            {result.prognosis}
          </p>
        </section>

        <section className="space-y-4 p-6 bg-gray-50 rounded-2xl">
          <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Научный контекст (Глобальные данные)</h4>
          <p className="text-[11px] text-gray-400 font-light leading-relaxed italic">
            {result.scientificContext}
          </p>
        </section>
      </div>

      <div className="pt-8 print:hidden flex gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-4 bg-gray-900 text-white rounded-full text-xs tracking-widest hover:bg-black transition-all uppercase"
        >
          Скачать PDF (A4)
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 border border-gray-200 text-gray-500 rounded-full text-xs tracking-widest hover:bg-gray-50 transition-all uppercase"
        >
          Новый тест
        </button>
      </div>
    </div>
  );
};
