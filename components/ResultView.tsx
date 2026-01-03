
import React, { useState } from 'react';
import { AssessmentResult, UserData } from '../types';

interface ResultViewProps {
  result: AssessmentResult;
  userData: UserData;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, userData }) => {
  const [isSending, setIsSending] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const handleSendToChat = async () => {
    const tg = (window as any).Telegram?.WebApp;
    const chatId = tg?.initDataUnsafe?.user?.id;

    if (!chatId) {
      alert("Пожалуйста, запустите приложение из Telegram для отправки результата.");
      return;
    }

    setIsSending(true);
    
    const textReport = `<b>📊 РЕЗУЛЬТАТЫ CommuniCare AI</b>\n` +
      `<b>Ребенок:</b> ${userData.gender}, ${userData.age} лет\n\n` +
      `<b>АНАЛИЗ:</b>\n${result.analysis}\n\n` +
      `<b>РЕКОМЕНДАЦИИ:</b>\n${result.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\n` +
      `<b>ПРОГНОЗ:</b>\n${result.prognosis}\n\n` +
      `<i>Основано на: ${result.scientificContext}</i>`;

    try {
      await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_text',
          chatId: chatId,
          text: textReport
        })
      });
      alert("Текстовый отчет отправлен в ваш чат с ботом!");
    } catch (e) {
      alert("Ошибка при отправке.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    const opt = {
      margin: 10,
      filename: `Report_${userData.age}y.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().from(reportRef.current).set(opt).save();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      <div ref={reportRef} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold border-b pb-4 mb-4 uppercase tracking-tighter">Результаты анализа</h2>
        
        <div className="space-y-6 text-sm">
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Краткий вывод</p>
            <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Рекомендации</p>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-gray-700 pl-4 border-l-2 border-blue-50">{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSendToChat}
          disabled={isSending}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {isSending ? "Отправка..." : "Отправить в мой чат (Текст)"}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black"
        >
          Скачать PDF
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 text-gray-400 text-[10px] uppercase tracking-widest"
        >
          Пройти заново
        </button>
      </div>
    </div>
  );
};
