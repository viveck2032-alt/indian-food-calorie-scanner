import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/80 backdrop-blur rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-6 border border-white">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800">Analyzing your plate...</h3>
        <p className="text-gray-500 mt-2 text-sm">Identifying spices and calculating macros.</p>
      </div>
    </div>
  );
};

export default LoadingState;
