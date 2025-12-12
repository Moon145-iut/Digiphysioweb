import { useCallback, useEffect, useState } from 'react';
import { uploadAvatarToSupabase } from '../services/avatarUpload';

export interface Profile {
  id: string;
  name: string;
  age: number;
  painArea: string;
  goal: string;
  avatarUrl: string | null;
}

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/profile`);
      if (!res.ok) throw new Error('Failed to load profile');
      const data: Profile = await res.json();
      setProfile(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (partial: Partial<Profile>) => {
    if (!profile) return;
    const res = await fetch(`${BACKEND_BASE}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, ...partial }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data: Profile = await res.json();
    setProfile(data);
  };

  const uploadAvatar = async (file: File) => {
    if (!profile) {
      throw new Error('Profile must be loaded before uploading an avatar.');
    }
    const avatarUrl = await uploadAvatarToSupabase(file, profile.id);
    await updateProfile({ avatarUrl });
  };

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword: async (currentPassword: string, newPassword: string) => {
      const res = await fetch(`${BACKEND_BASE}/api/profile/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }
    },
  };
};
