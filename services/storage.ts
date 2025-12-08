import { db } from './firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserProfile, DailyStats } from '../types';
import { STORAGE_KEY_USER as KEY_USER, STORAGE_KEY_STATS as KEY_STATS } from '../constants';

// Helper to get user-specific stats key
const getStatsKey = (userId: string) => `${KEY_STATS}_${userId || 'guest'}`;

// Save user data to Firestore
export const saveUser = async (user: UserProfile) => {
  try {
    await setDoc(doc(db, "users", user.id), user);
  } catch (error) {
    console.warn("saveUser Firestore fallback:", error);
  } finally {
    saveUserLocal(user);
  }
};

// Load user data from Firestore
export const loadUser = async (userId?: string): Promise<UserProfile | null> => {
  if (!userId) {
    return loadUserLocal();
  }
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : loadUserLocal();
  } catch (error) {
    console.warn("loadUser Firestore fallback:", error);
    return loadUserLocal();
  }
};

// Local storage functions
export const saveUserLocal = (user: UserProfile) => {
  localStorage.setItem(KEY_USER, JSON.stringify(user));
};

export const loadUserLocal = (): UserProfile | null => {
  const data = localStorage.getItem(KEY_USER);
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  const user = loadUserLocal();
  localStorage.removeItem(KEY_USER);
  if (user) {
    localStorage.removeItem(getStatsKey(user.id));
  }
};

// Daily stats functions (user-specific)
export const getDailyStats = (dateKey: string, userId?: string): DailyStats => {
  const user = userId || (loadUserLocal()?.id ?? 'guest');
  const statsKey = getStatsKey(user);
  const allStatsStr = localStorage.getItem(statsKey);
  const allStats = allStatsStr ? JSON.parse(allStatsStr) : {};
  
  if (!allStats[dateKey]) {
    allStats[dateKey] = {
      date: dateKey,
      steps: 0,
      distanceMeters: 0,
      calories: 0,
      workouts: [],
      checklist: {}
    };
    localStorage.setItem(statsKey, JSON.stringify(allStats));
  }
  return allStats[dateKey];
};

export const saveDailyStats = (stats: DailyStats, userId?: string) => {
  const user = userId || (loadUserLocal()?.id ?? 'guest');
  const statsKey = getStatsKey(user);
  const allStatsStr = localStorage.getItem(statsKey);
  const allStats = allStatsStr ? JSON.parse(allStatsStr) : {};
  allStats[stats.date] = stats;
  localStorage.setItem(statsKey, JSON.stringify(allStats));
};

export const getAllStats = (userId?: string): DailyStats[] => {
  const user = userId || (loadUserLocal()?.id ?? 'guest');
  const statsKey = getStatsKey(user);
  const allStatsStr = localStorage.getItem(statsKey);
  const allStats = allStatsStr ? JSON.parse(allStatsStr) : {};
  return Object.values(allStats);
};
