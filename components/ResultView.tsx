
import React from 'react';
import { AssessmentResult, UserData } from '../types';

interface ResultViewProps {
  result: AssessmentResult;
  userData: UserData;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, userData }) => {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 print:m-0 print:p-0 print:space-y-6">
      <div className="space-y-2 border-b border-gray-100 pb-6 print:pb-4 print:border-b-2 print:border-gray-900">
        <h2 className="text-3xl font-extralight text-gray-900 print:text-2xl">Экспертное заключение</h2>
        <p className="text-xs uppercase tracking-widest text-gray-400 print:text-gray-600 print:font-bold">
          Пациент: {userData.gender}, {userData.age} лет
        </p>
      </div>

      <div className="space-y-8 print:space-y-6">
        <section className="space-y-3 print:break-inside-avoid">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Анализ текущего состояния</h4>
          <p className="text-gray-600 font-light leading-relaxed text-sm whitespace-pre-wrap print:text-gray-900 print:leading-normal">
            {result.analysis}
          </p>
        </section>

        <section className="space-y-3 print:break-inside-avoid">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Рекомендации специалиста</h4>
          <ul className="grid grid-cols-1 gap-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-600 font-light leading-snug print:text-gray-900">
                <span className="text-gray-300 print:text-gray-900">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 print:break-inside-avoid">
          <h4 className="text-xs uppercase tracking-widest text-gray-900 font-bold">Прогноз развития</h4>
          <p className="text-gray-600 font-light leading-relaxed text-sm print:text-gray-900 print:leading-normal">
            {result.prognosis}
          </p>
        </section>

        <section className="space-y-3 p-6 bg-gray-50 rounded-2xl print:bg-white print:border print:border-gray-200 print:p-4 print:break-inside-avoid">
          <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold print:text-gray-700">Научный контекст</h4>
          <p className="text-[11px] text-gray-400 font-light leading-relaxed italic print:text-gray-600">
            {result.scientificContext}
          </p>
        </section>
      </div>

      <div className="pt-8 print:hidden flex gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-4 bg-gray-900 text-white rounded-full text-xs tracking-widest hover:bg-black transition-all uppercase font-medium"
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
      
      <div className="hidden print:block pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-widest">
        CommuniCare AI: Экспертная система оценки коммуникации
      </div>
    </div>
  );
};
