import React, { useRef, useEffect, useState } from 'react';
import { ExerciseDef } from '../types';
import { ArrowLeft, Play, Square, Video, Volume2 } from 'lucide-react';
import { getPostureScore } from '../utils/postureUtils';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface SessionProps {
  exercise: ExerciseDef;
  onClose: (score: number, duration: number) => void;
}

const ExerciseSessionScreen: React.FC<SessionProps> = ({ exercise, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(exercise.durationMin * 60); // Default full duration
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState("Align yourself in frame");
  const [permissionError, setPermissionError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);
  const lastSpeakTime = useRef<number>(0);
  
  // Voice synth
  const speak = (text: string) => {
    const now = Date.now();
    if (now - lastSpeakTime.current > 4000) { // Throttle speech 4s
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      lastSpeakTime.current = now;
    }
  };

  useEffect(() => {
    const setupVision = async () => {
      try {
        const visionGen = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        landmarkerRef.current = await PoseLandmarker.createFromOptions(visionGen, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setPermissionError("Failed to load AI models. Check internet.");
      }
    };
    setupVision();
    
    return () => {
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
       if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
       }
    }
  }, []);

  // 1. Get Stream and switch view
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
          } 
      });
      streamRef.current = stream;
      setIsPlaying(true);
      speak(`Starting ${exercise.title}. Get ready.`);
    } catch (err) {
      console.error(err);
      setPermissionError("Camera access denied. Please allow camera access.");
    }
  };

  // 2. Attach stream to video element once view is rendered
  useEffect(() => {
      if (isPlaying && videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().then(() => {
              // Start prediction loop only after video plays
              requestRef.current = requestAnimationFrame(predictWebcam);
          }).catch(e => console.error("Video play error:", e));
      }
  }, [isPlaying]);

  const predictWebcam = async () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;

    // Timer logic
    setTimeLeft(prev => {
        if (prev <= 1) {
            // Need to handle stop in a way that doesn't conflict with render loop
            // For now, we'll let the next render cycle catch it or call stop explicitly
            return 0;
        }
        return prev - 0.05; // Approx for frame rate
    });
    
    // Check if time is up
    if (timeLeft <= 0) {
        stopSession();
        return;
    }

    // Detect
    let startTimeMs = performance.now();
    if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const result = landmarkerRef.current.detectForVideo(video, startTimeMs);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (result.landmarks && result.landmarks.length > 0) {
            const landmarks = result.landmarks[0];
            
            // Draw Dots
            ctx.fillStyle = "#0d9488"; // teal-600
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";

            for (const lm of landmarks) {
                const x = lm.x * canvas.width;
                const y = lm.y * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }

            // Logic
            const analysis = getPostureScore(landmarks, exercise.id);
            setScore(Math.round(analysis.score));
            setFeedback(analysis.feedback);
            
            if (analysis.score < 70) speak(analysis.feedback);
        }
    }

    if (isPlaying) {
        requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  const stopSession = () => {
    setIsPlaying(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(requestRef.current);
    // Use the current time elapsed
    const elapsed = exercise.durationMin * 60 - timeLeft;
    onClose(score, elapsed);
  };

  if (!isPlaying) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 animate-fade-in overflow-y-auto">
        <button onClick={() => onClose(0, 0)} className="self-start p-2 mb-4 bg-gray-100 rounded-full">
            <ArrowLeft />
        </button>
        
        <img src={exercise.thumbnail} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-md" alt="Demo" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
        <div className="flex gap-2 mb-4">
            {exercise.tags.map(t => (
                <span key={t} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase">{t}</span>
            ))}
        </div>
        <p className="text-gray-600 mb-8">{exercise.description}</p>
        
        <div className="mt-auto">
            {permissionError ? (
                <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-4 text-center">{permissionError}</div>
            ) : (
                <button 
                  onClick={startCamera} 
                  disabled={loading}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {loading ? "Loading AI..." : <><Play fill="currentColor" /> Start Session</>}
                </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       {/* Top Bar */}
       <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 text-white bg-gradient-to-b from-black/50 to-transparent">
          <div>
              <h2 className="font-bold">{exercise.title}</h2>
              <div className={`text-sm font-mono px-2 py-0.5 rounded ${score > 80 ? 'bg-green-500' : 'bg-orange-500'} inline-block`}>
                Score: {score}
              </div>
          </div>
          <button onClick={stopSession} className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30">
             <Square fill="white" size={16} />
          </button>
       </div>

       {/* Camera View */}
       <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
           {/* Note: transform scale-x-[-1] mirrors the camera for natural feel */}
           <video 
             ref={videoRef} 
             className="absolute w-full h-full object-cover transform scale-x-[-1]" 
             playsInline 
             muted 
           />
           <canvas 
             ref={canvasRef} 
             className="absolute w-full h-full object-cover transform scale-x-[-1]" 
           />
           
           {/* Feedback Overlay */}
           <div className="absolute bottom-8 left-0 w-full text-center px-4">
              <div className="inline-block bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg transition-all duration-300">
                 {feedback}
              </div>
           </div>
       </div>

       {/* Bottom Controls */}
       <div className="h-24 bg-white text-gray-900 flex items-center justify-between px-8 rounded-t-3xl -mt-4 z-20 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="text-center w-16">
              <span className="block text-xs text-gray-500 uppercase font-bold">Time</span>
              <span className="text-2xl font-mono font-bold text-gray-800">
                  {Math.floor(timeLeft / 60)}:{(Math.floor(timeLeft) % 60).toString().padStart(2, '0')}
              </span>
          </div>
          
          <div className="w-16 h-16 bg-teal-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center -mt-8 animate-pulse ring-2 ring-teal-100">
             <Video className="text-teal-600" size={28} />
          </div>

          <div className="text-center w-16 opacity-50">
             <Volume2 size={24} className="mx-auto" />
             <span className="text-[10px] uppercase font-bold">Voice On</span>
          </div>
       </div>
    </div>
  );
};

export default ExerciseSessionScreen;