
import React, { useRef } from 'react';
import { AssessmentResult, UserData } from '../types';

interface ResultViewProps {
  result: AssessmentResult;
  userData: UserData;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, userData }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    
    const element = reportRef.current;
    
    // Настройки для идеального попадания в А4
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Report_${userData.age}y.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Контейнер отчета - оптимизирован для одной страницы А4 */}
      <div 
        ref={reportRef} 
        className="bg-white p-4 text-[#1a1a1a]"
        style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
      >
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Заключение CommuniCare AI</h2>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-medium uppercase text-gray-500">
              Пациент: {userData.gender}, {userData.age} лет
            </p>
            <p className="text-[10px] text-gray-400 uppercase">Дата: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-[10px] uppercase font-black tracking-widest mb-2 text-gray-400">01. Анализ состояния</h4>
            <p className="text-sm leading-relaxed text-justify">
              {result.analysis}
            </p>
          </section>

          <section>
            <h4 className="text-[10px] uppercase font-black tracking-widest mb-2 text-gray-400">02. Рекомендации</h4>
            <div className="grid grid-cols-1 gap-1">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-sm leading-snug">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] uppercase font-black tracking-widest mb-2 text-gray-400">03. Прогноз</h4>
            <p className="text-sm leading-relaxed italic">
              {result.prognosis}
            </p>
          </section>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-[9px] uppercase font-black tracking-widest mb-1 text-gray-400">Научная база</h4>
            <p className="text-[10px] text-gray-500 leading-tight">
              {result.scientificContext}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs tracking-widest hover:bg-black transition-all uppercase font-bold"
        >
          Скачать отчет (PDF)
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 border border-gray-200 text-gray-400 rounded-2xl text-xs tracking-widest hover:bg-gray-50 transition-all uppercase"
        >
          Пройти заново
        </button>
      </div>
    </div>
  );
};
