import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera with preference for the rear camera on mobile
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to actually be ready to play
          videoRef.current.onloadedmetadata = () => {
            setIsStreaming(true);
            videoRef.current?.play().catch(e => console.error("Play error:", e));
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };

    startCamera();

    // Cleanup: Stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally if using front camera (optional, usually environment is preferred for food)
        // ctx.scale(-1, 1); 
        // ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const base64Data = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(base64Data);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-[3/4] md:aspect-square flex flex-col animate-fade-in">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
            >
                Close Camera
            </button>
        </div>
      ) : (
        <>
            {/* Video Feed */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Loading Indicator */}
            {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                <div className="flex justify-end pointer-events-auto">
                    <button 
                        onClick={onClose}
                        className="p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex justify-center mb-4 pointer-events-auto">
                    <button 
                        onClick={handleCapture}
                        disabled={!isStreaming}
                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-12 h-12 bg-white rounded-full"></div>
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;