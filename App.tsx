import React, { useState, useEffect } from 'react';
import { UserProfile, DailyStats, EXERCISES, ExerciseDef, ExerciseSession, ExercisePreference } from './types';
import { saveUser, loadUserLocal, getDailyStats, saveDailyStats, getAllStats, clearSession, hasActiveSession, markSessionActive, markSessionInactive } from './services/storage';
import { ArrowLeft } from 'lucide-react';
import { getRehabExerciseDef } from './data/rehabExerciseLibrary';
import { useProfile, Profile } from './hooks/useProfile';
import { ProfilePanel } from './components/ProfilePanel';

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
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [savingProfileChanges, setSavingProfileChanges] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const { profile, loading: profileLoading, updateProfile, uploadAvatar, changePassword } = useProfile();

  // Load initial state
  useEffect(() => {
    if (!hasActiveSession()) {
      return;
    }
    const loadedUser = loadUserLocal();
    if (loadedUser) {
      setUser(loadedUser);
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayStats(getDailyStats(todayStr, loadedUser.id));
    }
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      markSessionInactive();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    saveUser(u);
    markSessionActive();
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayStats(getDailyStats(todayStr, u.id));
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveUser(updatedUser);
    markSessionActive();
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

  const handleExerciseComplete = (score: number, duration: number, reps?: number) => {
    setActiveExercise(null);
    const repText = reps && reps > 0 ? ` Reps: ${reps}.` : '';
    setSessionContext(`Just finished ${activeExercise?.title || 'exercise'}. Duration: ${Math.floor(duration)}s. Posture Score: ${score}/100.${repText}`);

    if (duration > 5 && user && todayStats) {
        const newSession: ExerciseSession = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            exerciseName: activeExercise?.title || 'Workout',
            durationSeconds: duration,
            avgPostureScore: score,
            repsCompleted: reps
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

  const fallbackProfile: Profile | null = user
    ? {
        id: user.id,
        name: user.name,
        age: user.age,
        painArea: user.painAreas?.[0] || user.exercisePreference?.area || 'GENERAL',
        goal: user.goals?.[0] || 'ACTIVE',
        avatarUrl: null,
      }
    : null;

  const effectiveProfile = profile || fallbackProfile;

  const handleProfileSave = async (newValues: Profile) => {
    setSavingProfileChanges(true);
    try {
      if (profile) {
        await updateProfile(newValues);
      } else if (user) {
        const updatedUser: UserProfile = {
          ...user,
          name: newValues.name ?? user.name,
          age: newValues.age ?? user.age,
          painAreas: [((newValues.painArea as any) || user.painAreas?.[0] || 'GENERAL')],
          goals: [((newValues.goal as any) || user.goals?.[0] || 'ACTIVE')],
        };
        setUser(updatedUser);
        saveUser(updatedUser);
      }
    } finally {
      setSavingProfileChanges(false);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl });
      saveUser({ ...user, avatarUrl });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (profile) {
      await uploadAvatar(file);
    } else {
      alert('Profile image upload requires the backend server to be running.');
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!profile) {
      throw new Error('Password change requires the backend server to be running.');
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
    } finally {
      setSavingPassword(false);
    }
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
            profileName={profile?.name || user.name}
            profileAvatar={profile?.avatarUrl || user.avatarUrl || null}
            onOpenProfile={() => setProfileOpen(true)}
            onAvatarChange={handleAvatarChange}
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

      {effectiveProfile && isProfileOpen && (
        <ProfilePanel
          profile={effectiveProfile}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
          onUploadAvatar={handleAvatarUpload}
          onChangePassword={handlePasswordChange}
          saving={savingProfileChanges}
          savingPassword={savingPassword}
        />
      )}

      {profile && isProfileOpen && (
        <ProfilePanel
          profile={profile}
          onClose={() => setProfileOpen(false)}
          onSave={updateProfile}
          onUploadAvatar={uploadAvatar}
        />
      )}
    </div>
  </div>
  );
};

export default App;
