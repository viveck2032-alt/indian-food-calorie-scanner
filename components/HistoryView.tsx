import React from 'react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onClear, onBack }) => {
  return (
    <div className="w-full max-w-md mx-auto h-[600px] flex flex-col bg-white/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden border border-orange-100 animate-fade-in">
      
      {/* Header */}
      <div className="bg-orange-100 p-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-orange-200 rounded-full transition-colors text-orange-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 className="text-xl font-bold text-gray-800">Scan History</h2>
        </div>
        {history.length > 0 && (
            <button 
                onClick={onClear}
                className="text-xs font-semibold text-red-500 hover:text-red-700 uppercase tracking-wide px-3 py-1 bg-white rounded-full border border-red-100 hover:border-red-300 transition-all"
            >
                Clear
            </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-gray-600 font-medium">No history yet</p>
                <p className="text-sm text-gray-500 mt-1">Scan your first meal to see it here.</p>
            </div>
        ) : (
            history.map((item) => (
                <div 
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{item.dish}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                            {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-semibold text-xs">
                            {item.calories}
                        </span>
                        <span className="text-gray-500 text-xs truncate max-w-[120px]">
                            {item.portion}
                        </span>
                    </div>
                </div>
            ))
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
        Results are stored locally on your device
      </div>
    </div>
  );
};

export default HistoryView;