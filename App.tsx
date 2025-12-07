import React, { useState, useEffect } from 'react';
import { UserProfile, DailyStats, EXERCISES, ExerciseDef, ExerciseSession, ExercisePreference } from './types';
import { saveUser, loadUserLocal, getDailyStats, saveDailyStats, getAllStats, clearSession } from './services/storage';
import { ArrowLeft } from 'lucide-react';
import { getRehabExerciseDef } from './data/rehabExerciseLibrary';

// Screens
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import SpecialistScreen from './screens/SpecialistScreen';
import ExerciseSessionScreen from './screens/ExerciseSessionScreen';
import MealsScreen from './screens/MealsScreen';

import BottomNav from './components/BottomNav';
import GeminiChat from './components/GeminiChat';
import SubscriptionModal from './components/SubscriptionModal';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
  
  const [activeExercise, setActiveExercise] = useState<ExerciseDef | null>(null);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);

  // Context for AI Specialist
  const [sessionContext, setSessionContext] = useState<string>("");

  // Subscription Modal State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Load initial state
  useEffect(() => {
    const loadedUser = loadUserLocal();
    if (loadedUser) {
      setUser(loadedUser);
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayStats(getDailyStats(todayStr, loadedUser.id));
    }
  }, []);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    saveUser(u);
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayStats(getDailyStats(todayStr, u.id));
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveUser(updatedUser);
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayStats(getDailyStats(todayStr, updatedUser.id));
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setTodayStats(null);
    setCurrentTab('home');
    setTabHistory(['home']);
    setSessionContext("");
  };

  const handleTabChange = (newTab: string) => {
    if (newTab === currentTab) return;

    if (newTab === 'specialist') {
      if (!user?.isSubscribed) {
        setShowSubscriptionModal(true);
        return;
      }
    }

    setTabHistory(prev => [...prev, newTab]);
    setCurrentTab(newTab);
    
    // Update Context
    if (newTab === 'meals') setSessionContext("Browsing Meals");
    if (newTab === 'home') setSessionContext("On Home Dashboard");
  };

  const handleSubscribe = (plan: 'WEEKLY' | 'MONTHLY') => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      isSubscribed: true,
      subscriptionPlan: plan
    };
    setUser(updatedUser);
    saveUser(updatedUser);
    setShowSubscriptionModal(false);
    
    setTabHistory(prev => [...prev, 'specialist']);
    setCurrentTab('specialist');
  };

  const handleBack = () => {
    if (tabHistory.length <= 1) return;
    
    const newHistory = [...tabHistory];
    newHistory.pop();
    const prevTab = newHistory[newHistory.length - 1];
    
    setTabHistory(newHistory);
    setCurrentTab(prevTab);
  };

  const handleStartExercise = (exId: string) => {
    const ex = EXERCISES.find(e => e.id === exId) || getRehabExerciseDef(exId);
    if (ex) {
      setActiveExercise(ex);
      setSessionContext(`Currently performing exercise: ${ex.title}. Duration goal: ${ex.durationMin} mins.`);
    }
  };

  const handleExerciseComplete = (score: number, duration: number) => {
    setActiveExercise(null);
    setSessionContext(`Just finished ${activeExercise?.title || 'exercise'}. Duration: ${Math.floor(duration)}s. Posture Score: ${score}/100.`);

    if (duration > 5 && user && todayStats) {
        const newSession: ExerciseSession = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            exerciseName: activeExercise?.title || 'Workout',
            durationSeconds: duration,
            avgPostureScore: score
        };

        const updatedStats = {
            ...todayStats,
            workouts: [...todayStats.workouts, newSession]
        };
        setTodayStats(updatedStats);
        saveDailyStats(updatedStats, user.id);
    }
  };

  const handleChecklistUpdate = (key: string, val: boolean) => {
      if (!todayStats || !user) return;
      const updatedStats = {
          ...todayStats,
          checklist: { ...todayStats.checklist, [key]: val }
      };
      setTodayStats(updatedStats);
      saveDailyStats(updatedStats, user.id);
  };

  const handleSaveRehabPreference = (preference: ExercisePreference) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      exercisePreference: preference,
    };
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  if (!user.onboardingComplete) return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  if (activeExercise) return <ExerciseSessionScreen exercise={activeExercise} onClose={handleExerciseComplete} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 font-sans">
      <div className="w-full max-w-5xl xl:max-w-6xl mx-auto min-h-screen px-4 sm:px-6 lg:px-12 pb-24 relative">
      
      {tabHistory.length > 1 && (
        <button 
          onClick={handleBack}
          className="fixed top-4 left-4 z-40 p-2 rounded-full shadow-md transition-colors bg-white text-gray-700 border border-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {showSubscriptionModal && (
        <SubscriptionModal 
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      {currentTab === 'home' && todayStats && (
        <HomeScreen 
            user={user} 
            stats={todayStats} 
            onStartExercise={handleStartExercise}
            onUpdateChecklist={handleChecklistUpdate}
            onNavigateToMeals={() => handleTabChange('meals')}
            onSaveRehabPreference={handleSaveRehabPreference}
        />
      )}
      
      {currentTab === 'dashboard' && (
        <DashboardScreen 
            allStats={getAllStats(user?.id)} 
            onLogout={handleLogout} 
            user={user}
        />
      )}
      
      {currentTab === 'meals' && (
        <MealsScreen setContext={setSessionContext} />
      )}
      
      {currentTab === 'specialist' && <SpecialistScreen />}

      <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
      
      <GeminiChat userProfile={user} sessionContext={sessionContext} />
    </div>
  </div>
  );
};

export default App;
