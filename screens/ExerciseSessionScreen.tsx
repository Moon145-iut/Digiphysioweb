import React, { useRef, useEffect, useState } from 'react';
import { ExerciseDef } from '../types';
import { ArrowLeft, Play, Square, Video, Volume2, Check } from 'lucide-react';
import { getPostureScore, detectRepTransition } from '../utils/postureUtils';
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';

interface SessionProps {
  exercise: ExerciseDef;
  onClose: (score: number, duration: number, reps?: number) => void;
}

const ExerciseSessionScreen: React.FC<SessionProps> = ({ exercise, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState(exercise.durationMin * 60);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(exercise.durationMin * 60);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState("Align yourself in frame");
  const [repsCount, setRepsCount] = useState(0);
  const [permissionError, setPermissionError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalReps, setFinalReps] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);
  const lastVoiceKey = useRef<string | null>(null);
  const lastVoiceTime = useRef<number>(0);
  const repCounterStateRef = useRef({ reps: 0, lastState: 'unknown' as 'up' | 'down' | 'unknown', stateConfidence: 0 });
  const lastFrameTimeRef = useRef<number>(0);

  const FRAME_INTERVAL = 1000 / 15; // ~15 FPS target

  // Pose connections for skeleton drawing
  const POSE_CONNECTIONS: [number, number][] = [
    [11, 13], [13, 15],    // left arm
    [12, 14], [14, 16],    // right arm
    [11, 12],              // shoulders
    [11, 23], [12, 24],    // torso
    [23, 25], [25, 27],    // left leg
    [24, 26], [26, 28],    // right leg
  ];
  
  const speak = (text: string) => {
    const now = Date.now();
    if (now - lastVoiceTime.current > 4000 && text !== feedback) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      lastVoiceTime.current = now;
    }
  };

  // Voice coach with key-based throttling (no spam!)
  const speakCoach = (key: string | undefined, text: string) => {
    if (!key) return;
    const now = Date.now();
    // 4s cooldown per key to avoid spam
    if (key === lastVoiceKey.current && now - lastVoiceTime.current < 4000) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    lastVoiceKey.current = key;
    lastVoiceTime.current = now;
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

  const handleTimeSelect = (seconds: number) => {
    setSelectedDurationSeconds(seconds);
    setCustomTimeInput('');
  };

  const handleCustomTimeChange = (value: string) => {
    setCustomTimeInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedDurationSeconds(parsed);
    }
  };

  const TIME_PRESETS = [10, 30, 60, 180, 300]; // 10s, 30s, 1min, 3min, 5min

  useEffect(() => {
      if (isPlaying && videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          setTimeLeft(selectedDurationSeconds);
          videoRef.current.play().then(() => {
              lastFrameTimeRef.current = performance.now();
              requestRef.current = requestAnimationFrame(predictWebcam);
          }).catch(e => console.error("Video play error:", e));
      }
  }, [isPlaying, selectedDurationSeconds]);

  const predictWebcam = (nowMs: number) => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    // Throttle to target FPS
    if (nowMs - lastFrameTimeRef.current < FRAME_INTERVAL) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    lastFrameTimeRef.current = nowMs;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Update timer
    setTimeLeft(prev => {
      const next = prev - (FRAME_INTERVAL / 1000);
      if (next <= 0) {
        setTimeout(() => stopSession(), 0);
        return 0;
      }
      return next;
    });

    // Detect pose
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const result = landmarkerRef.current.detectForVideo(video, nowMs);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];
        
        // Draw skeleton lines
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(13, 148, 136, 0.8)";
        for (const [i, j] of POSE_CONNECTIONS) {
          const a = landmarks[i];
          const b = landmarks[j];
          if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) continue;
          const ax = a.x * canvas.width;
          const ay = a.y * canvas.height;
          const bx = b.x * canvas.width;
          const by = b.y * canvas.height;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        // Draw joints
        ctx.fillStyle = "#0d9488";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        for (const lm of landmarks) {
          if (lm.visibility < 0.5) continue;
          const x = lm.x * canvas.width;
          const y = lm.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }

        // Analyze posture and update score smoothly
        const analysis = getPostureScore(landmarks, exercise.id);
        setScore(prev => Math.round(prev * 0.8 + analysis.score * 0.2)); // Smooth transition
        setFeedback(analysis.feedback);
        
        // Use directional voice cues with key-based throttling
        if (analysis.key && analysis.key !== 'good' && analysis.key !== 'no_pose') {
          speakCoach(analysis.key, analysis.feedback);
        }
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
    const elapsed = selectedDurationSeconds - timeLeft;
    
    // Show completion modal instead of closing immediately
    setFinalScore(score);
    setFinalReps(repsCount);
    setFinalDuration(elapsed);
    setShowCompletion(true);
    
    // Speak congratulations
    const utterance = new SpeechSynthesisUtterance(`Congratulations! Well done! You completed the session with a score of ${score} out of 100.`);
    utterance.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!isPlaying) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 animate-fade-in overflow-y-auto">
        <button onClick={() => onClose(0, 0, 0)} className="self-start p-2 mb-4 bg-gray-100 rounded-full">
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
        
        {/* Time Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select Duration</h3>
          
          {/* Time Presets */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TIME_PRESETS.map(seconds => {
              const isSelected = selectedDurationSeconds === seconds;
              const display = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
              return (
                <button
                  key={seconds}
                  onClick={() => handleTimeSelect(seconds)}
                  className={`py-3 px-4 rounded-xl font-bold transition-all ${
                    isSelected 
                      ? 'bg-teal-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {display}
                </button>
              );
            })}
          </div>
          
          {/* Custom Input */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom seconds"
              value={customTimeInput}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-600 focus:outline-none font-mono"
              min="1"
            />
            <button
              onClick={() => {
                if (customTimeInput) {
                  const seconds = parseInt(customTimeInput, 10);
                  if (!isNaN(seconds) && seconds > 0) {
                    handleTimeSelect(seconds);
                  }
                }
              }}
              className="px-4 py-3 bg-teal-100 text-teal-600 rounded-xl font-bold hover:bg-teal-200 transition-all"
            >
              Set
            </button>
          </div>
          
          {/* Display Selected */}
          <p className="text-sm text-gray-500 mt-3 text-center">
            Selected: <span className="font-bold text-teal-600">{Math.floor(selectedDurationSeconds / 60)}:{(selectedDurationSeconds % 60).toString().padStart(2, '0')}</span>
          </p>
        </div>
        
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
              <div className="flex gap-2">
                <div className={`text-sm font-mono px-2 py-0.5 rounded ${score > 80 ? 'bg-green-500' : 'bg-orange-500'} inline-block`}>
                  Score: {score}
                </div>
                {repsCount > 0 && (
                  <div className="text-sm font-mono px-2 py-0.5 rounded bg-blue-500 inline-block">
                    Reps: {repsCount}
                  </div>
                )}
              </div>
          </div>
          <button onClick={stopSession} className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/30">
             <Square fill="white" size={16} />
          </button>
       </div>

       {/* Camera View */}
       <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
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

       {/* Completion Modal */}
       {showCompletion && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
             <div className="mb-6 flex justify-center">
               <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-600 rounded-full flex items-center justify-center">
                 <Check size={48} className="text-white" strokeWidth={3} />
               </div>
             </div>

             <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
             <p className="text-gray-600 mb-8 text-lg">Well done! You completed the session.</p>

             {/* Stats Grid */}
             <div className="grid grid-cols-3 gap-3 mb-8">
               <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                 <div className="text-sm text-gray-600 font-medium">Score</div>
                 <div className="text-2xl font-bold text-blue-600">{Math.round(finalScore)}</div>
                 <div className="text-xs text-gray-500">out of 100</div>
               </div>

               {finalReps > 0 && (
                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                   <div className="text-sm text-gray-600 font-medium">Reps</div>
                   <div className="text-2xl font-bold text-purple-600">{finalReps}</div>
                   <div className="text-xs text-gray-500">completed</div>
                 </div>
               )}

               <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
                 <div className="text-sm text-gray-600 font-medium">Time</div>
                 <div className="text-2xl font-bold text-orange-600">{Math.floor(finalDuration / 60)}:{(Math.floor(finalDuration) % 60).toString().padStart(2, '0')}</div>
                 <div className="text-xs text-gray-500">minutes</div>
               </div>
             </div>

             {/* Motivational Message */}
             <div className="mb-8 p-4 bg-teal-50 rounded-2xl border border-teal-200">
               <p className="text-teal-700 font-medium">
                 {finalScore >= 90 ? '🌟 Excellent form! Keep it up!' : 
                  finalScore >= 75 ? '👏 Good effort! Keep practicing!' : 
                  '💪 Keep working on your form!'}
               </p>
             </div>

             <button
               onClick={() => {
                 setShowCompletion(false);
                 onClose(finalScore, finalDuration, finalReps);
               }}
               className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
             >
               Save & Continue
             </button>
           </div>
         </div>
       )}
    </div>
  );
};

export default ExerciseSessionScreen;