/**
 * Profile Service
 * Manages user profile data in Firestore
 */

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

/**
 * Save user avatar URL to Firestore
 */
export async function saveUserAvatar(uid: string, avatarUrl: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      avatarUrl,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving avatar to Firestore:', error);
    throw error;
  }
}

/**
 * Load user profile from Firestore
 */
export async function loadUserProfile(uid: string): Promise<Partial<UserProfile> | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile from Firestore:', error);
    return null;
  }
}

/**
 * Save complete user profile to Firestore
 */
export async function saveUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    throw error;
  }
}
