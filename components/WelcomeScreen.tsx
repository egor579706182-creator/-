
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="text-center space-y-12 animate-in fade-in duration-700">
      <h2 className="text-4xl font-extralight text-gray-900 tracking-tight">Оценка коммуникации</h2>
      <button
        onClick={onStart}
        className="px-12 py-5 bg-gray-900 text-white rounded-full text-xs tracking-[0.2em] hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 uppercase"
      >
        Начать
      </button>
    </div>
  );
};
