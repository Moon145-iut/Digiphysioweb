import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Stethoscope } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { UserProfile } from '../types';

interface GeminiChatProps {
  userProfile: UserProfile | null;
  sessionContext?: string; // e.g., "Performing Squats" or "Finished Neck Stretch"
}

const GeminiChat: React.FC<GeminiChatProps> = ({ userProfile, sessionContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hello. I am your FlexiPhysio Specialist. How is your body feeling today?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    // Pass the session context to the service
    const reply = await chatWithAssistant(userMsg, userProfile, messages, sessionContext);
    
    setMessages(prev => [...prev, { role: 'model', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 bg-teal-800 text-white p-3 rounded-full shadow-xl z-40 transition-transform hover:scale-105 border-2 border-teal-600 ${isOpen ? 'hidden' : 'flex items-center gap-2'}`}
      >
        <Stethoscope size={24} />
        <span className="text-sm font-bold pr-1">Talk to Specialist</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 md:bottom-20 md:right-4 h-[550px] max-h-screen bg-white shadow-2xl rounded-t-2xl md:rounded-2xl flex flex-col z-50 overflow-hidden border border-gray-100 font-sans">
          {/* Header */}
          <div className="bg-teal-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Stethoscope size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm">Dr. Flex</h3>
                  <div className="flex items-center gap-1">
                     <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                     <span className="text-xs text-teal-200">Online Specialist</span>
                  </div>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
              <X size={24} />
            </button>
          </div>
          
          {/* Context Banner if Active */}
          {sessionContext && (
             <div className="bg-teal-50 px-4 py-2 text-xs text-teal-800 border-b border-teal-100 flex items-center gap-2">
                 <span className="font-bold">Context:</span> {sessionContext}
             </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-teal-700 text-white rounded-br-none shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-2 items-center">
                   <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms or ask a question..."
              className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-3 bg-teal-800 text-white rounded-full shadow-md disabled:opacity-50 hover:bg-teal-900 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChat;
