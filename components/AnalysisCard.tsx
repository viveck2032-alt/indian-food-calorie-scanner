import React from 'react';
import { FoodAnalysisResult } from '../types';
import { Doughnut, Bar } from 'react-chartjs-2'; // Mocking chart usage or using svg directly for simpler bundle

interface AnalysisCardProps {
  result: FoodAnalysisResult;
  onReset: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ result, onReset }) => {
  if (!result.is_food) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border-l-4 border-red-500 animate-fade-in">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Not Food Detected</h3>
        <p className="text-gray-600 mb-6">
          We couldn't identify any Indian food in this image. Please try uploading a clearer photo of a meal.
        </p>
        <button
          onClick={onReset}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Determine confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden border border-orange-100 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">{result.dish}</h2>
            <p className="opacity-90 text-sm">Indian Cuisine Analysis</p>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-orange-600 text-xs font-bold uppercase tracking-wide mb-1">Calories</p>
                <p className="text-2xl font-bold text-gray-900">{result.calories}</p>
            </div>
             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-1">Portion</p>
                <p className="text-lg font-semibold text-gray-900 leading-tight">{result.portion}</p>
            </div>
        </div>

        {/* Confidence Meter */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm font-medium">AI Confidence</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence}% Match
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${result.confidence}%` }}
                ></div>
            </div>
        </div>

        {/* Explanation (if available) */}
        {result.explanation && (
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 italic">
                "{result.explanation}"
            </div>
        )}

        <button
          onClick={onReset}
          className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-lg shadow-gray-300 transition-all active:scale-95"
        >
          Scan Another Dish
        </button>
      </div>
    </div>
  );
};

export default AnalysisCard;
