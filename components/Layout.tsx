
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#fafafa]">
      <div className="w-full max-w-2xl print:max-w-none">
        <main className="bg-white rounded-[40px] p-8 md:p-16 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 print:shadow-none print:border-0 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
};
