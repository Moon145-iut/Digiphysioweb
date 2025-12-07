
import React from 'react';
import { Home, Activity, UserCheck, Utensils } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const getBtnClass = (tab: string) => 
    `flex flex-col items-center justify-center w-full h-full transition-colors ${
      currentTab === tab ? 'text-teal-600' : 'text-gray-400 hover:text-gray-700'
    }`;

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe shadow-lg">
      <button onClick={() => onTabChange('home')} className={getBtnClass('home')}>
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">Home</span>
      </button>
      <button onClick={() => onTabChange('dashboard')} className={getBtnClass('dashboard')}>
        <Activity size={24} />
        <span className="text-[10px] mt-1 font-medium">Stats</span>
      </button>
      <button onClick={() => onTabChange('meals')} className={getBtnClass('meals')}>
        <Utensils size={24} />
        <span className="text-[10px] mt-1 font-medium">Meals</span>
      </button>
      <button onClick={() => onTabChange('specialist')} className={getBtnClass('specialist')}>
        <UserCheck size={24} />
        <span className="text-[10px] mt-1 font-medium">Specialist</span>
      </button>
    </div>
  );
};

export default BottomNav;
