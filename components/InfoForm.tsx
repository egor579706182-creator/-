
import React, { useState } from 'react';
import { Gender, UserData } from '../types';

interface InfoFormProps {
  onSubmit: (data: UserData) => void;
}

export const InfoForm: React.FC<InfoFormProps> = ({ onSubmit }) => {
  const [age, setAge] = useState<number>(1);
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-light text-gray-800">Данные ребенка</h3>
        <p className="text-sm text-gray-400">Это поможет адаптировать вопросы под возрастные нормы</p>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <label className="text-xs uppercase tracking-widest text-gray-400">Возраст (лет)</label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                onClick={() => setAge(val)}
                className={`py-3 rounded-xl border text-sm transition-all ${
                  age === val 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <label className="text-xs uppercase tracking-widest text-gray-400">Пол</label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(Gender).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`py-4 rounded-xl border text-sm transition-all ${
                  gender === g 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSubmit({ age, gender })}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl text-sm tracking-wider hover:bg-black transition-all"
      >
        ПРОДОЛЖИТЬ
      </button>
    </div>
  );
};
