import React, { useState } from 'react';
import { UserProfile, PainArea, Goal } from '../types';
import { ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    age: 30,
    painAreas: [],
    goals: [],
    activityLevel: 'MEDIUM'
  });

  const nextStep = () => setStep(s => s + 1);

  const finish = () => {
    let mode: UserProfile['mode'] = 'GENERAL';
    if ((data.age || 0) < 20) mode = 'YOUTH';
    if ((data.age || 0) >= 40) mode = 'SENIOR';

    onComplete({
      ...user,
      ...data,
      mode,
      onboardingComplete: true
    } as UserProfile);
  };

  const toggleSelection = <T,>(list: T[], item: T, field: keyof UserProfile) => {
    const exists = list.includes(item);
    const newList = exists ? list.filter(i => i !== item) : [...list, item];
    setData({ ...data, [field]: newList });
  };

  return (
    <div className="min-h-screen bg-teal-600 text-white p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full pt-10">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-teal-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">About You</h2>
            <p className="text-teal-100 mb-8">Helps us tailor exercises safely.</p>
            
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide">Your Age</label>
            <input 
              type="number" 
              value={data.age}
              onChange={(e) => setData({...data, age: parseInt(e.target.value) || 0})}
              className="w-full text-4xl bg-transparent border-b-2 border-white/30 pb-2 text-white placeholder-white/50 focus:outline-none focus:border-white mb-8"
            />
            
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide">Activity Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setData({...data, activityLevel: level})}
                  className={`py-3 rounded-lg border ${data.activityLevel === level ? 'bg-white text-teal-600' : 'border-white/30 text-white'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Focus Areas</h2>
            <p className="text-teal-100 mb-8">Where do you feel stiffness or pain?</p>
            
            <div className="flex flex-wrap gap-3">
              {(['KNEE', 'SHOULDER', 'LOWER_BACK', 'UPPER_BACK', 'GENERAL'] as PainArea[]).map(area => (
                <button
                  key={area}
                  onClick={() => toggleSelection(data.painAreas || [], area, 'painAreas')}
                  className={`px-4 py-3 rounded-full border flex items-center gap-2 ${
                    data.painAreas?.includes(area) ? 'bg-white text-teal-600 font-bold' : 'border-white/30 text-white'
                  }`}
                >
                   {area.replace('_', ' ')}
                   {data.painAreas?.includes(area) && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Your Goals</h2>
            <p className="text-teal-100 mb-8">What do you want to achieve?</p>
            
            <div className="space-y-3">
              {(['REDUCE_PAIN', 'FLEXIBILITY', 'POSTURE', 'ACTIVE'] as Goal[]).map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleSelection(data.goals || [], goal, 'goals')}
                  className={`w-full text-left px-5 py-4 rounded-xl border flex justify-between items-center ${
                    data.goals?.includes(goal) ? 'bg-white text-teal-600 font-bold shadow-lg transform scale-105' : 'border-white/30 text-white'
                  }`}
                >
                   {goal.replace('_', ' ')}
                   {data.goals?.includes(goal) && <Check size={20} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 max-w-md mx-auto w-full">
        <button 
          onClick={step === 3 ? finish : nextStep}
          className="w-full bg-white text-teal-700 font-bold text-lg py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
        >
          {step === 3 ? "Let's Go!" : "Next"}
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;