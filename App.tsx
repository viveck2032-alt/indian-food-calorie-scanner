import React, { useState, useRef, useEffect } from 'react';
import { AppState, FoodAnalysisResult, HistoryItem } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisCard from './components/AnalysisCard';
import LoadingState from './components/LoadingState';
import HistoryView from './components/HistoryView';
import CameraCapture from './components/CameraCapture';

const HISTORY_STORAGE_KEY = 'currycal_history_v1';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount and setup Install Prompt listener
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }

    // Capture the install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const saveToHistory = (analysis: FoodAnalysisResult) => {
    const newItem: HistoryItem = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(item);
    setImagePreview(null); 
    setAppState(AppState.SUCCESS);
  };

  const processImage = async (base64Data: string) => {
    setImagePreview(base64Data);
    setAppState(AppState.ANALYZING);
    setIsCameraOpen(false); // Close camera if it was open
    setErrorMsg(null);

    try {
      // Strip the data:image/xyz;base64, prefix for the API
      const base64Content = base64Data.split(',')[1];
      const analysisData = await analyzeImage(base64Content);
      
      setResult(analysisData);
      setAppState(AppState.SUCCESS);
      
      if (analysisData.is_food) {
          saveToHistory(analysisData);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze the image. Please check your connection and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      await processImage(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (base64Data: string) => {
    processImage(base64Data);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setIsCameraOpen(false);
    setImagePreview(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 text-gray-900 font-sans selection:bg-orange-200">
      
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between relative z-10 max-w-4xl mx-auto w-full">
        <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={resetApp}
        >
            <div className="bg-orange-500 text-white p-2 rounded-lg shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 hidden sm:block">Curry<span className="text-orange-600">Cal</span></h1>
        </div>
        
        <div className="flex gap-2">
            {installPrompt && (
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white hover:bg-black rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md animate-pulse"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Install App
                </button>
            )}

            {appState !== AppState.HISTORY && (
                <button 
                    onClick={() => setAppState(AppState.HISTORY)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white backdrop-blur rounded-full text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all shadow-sm border border-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>History</span>
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12 flex flex-col items-center">
        
        {/* Intro Text - Only show when IDLE and Camera NOT open */}
        {appState === AppState.IDLE && !isCameraOpen && (
          <div className="text-center max-w-lg mb-10 mt-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
              Check calories in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Indian Food</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Take a photo or upload an image. Our AI will identify the meal and estimate the calories instantly.
            </p>
          </div>
        )}

        {/* Interaction Area */}
        <div className="w-full max-w-md relative z-10">
          
          {/* HISTORY VIEW */}
          {appState === AppState.HISTORY && (
            <HistoryView 
                history={history} 
                onSelect={loadHistoryItem}
                onClear={clearHistory}
                onBack={() => setAppState(AppState.IDLE)}
            />
          )}

          {/* CAMERA VIEW */}
          {isCameraOpen && (
             <CameraCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setIsCameraOpen(false)} 
             />
          )}

          {/* SELECTION BOX (IDLE) */}
          {appState === AppState.IDLE && !isCameraOpen && (
            <div className="bg-white/40 backdrop-blur rounded-3xl p-6 border border-white shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                    {/* Camera Button */}
                    <button 
                        onClick={() => setIsCameraOpen(true)}
                        className="flex flex-col items-center justify-center p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 group"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <span className="font-bold">Take Photo</span>
                    </button>

                    {/* Upload Button */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all active:scale-95 group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                             <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <span className="font-bold">Upload Image</span>
                    </button>
                </div>
            </div>
          )}

          {/* Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Preview Image During Analysis or Success */}
          {(appState === AppState.ANALYZING || appState === AppState.SUCCESS) && (
            <div className="mb-6 relative w-full h-64 md:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto transform transition-all hover:scale-[1.02] bg-gray-100">
                {imagePreview ? (
                    <img 
                        src={imagePreview} 
                        alt="Food Preview" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-orange-50">
                        <svg className="w-16 h-16 mb-2 text-orange-200" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        <span className="text-sm font-medium">Image not stored</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Loading State */}
          {appState === AppState.ANALYZING && <LoadingState />}

          {/* Success State */}
          {appState === AppState.SUCCESS && result && (
            <AnalysisCard result={result} onReset={resetApp} />
          )}

          {/* Error State */}
          {appState === AppState.ERROR && (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-md mb-6 animate-fade-in">
                <div className="flex">
                    <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    </div>
                    <div className="ml-3">
                    <p className="text-sm text-red-700">
                        {errorMsg || "Something went wrong."}
                    </p>
                    <button onClick={resetApp} className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline">Try Again</button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full overflow-hidden -z-10 pointer-events-none opacity-20">
         <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-orange-200 fill-current">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>

    </div>
  );
};

export default App;