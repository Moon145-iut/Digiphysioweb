import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { uploadAvatarToCloudinary } from '../services/avatarUpload';
import { saveUserAvatar } from '../services/profileService';

interface ProfileAvatarProps {
  uid: string;
  avatarUrl: string | null;
  name: string;
  onAvatarChange: (url: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  uid,
  avatarUrl,
  name,
  onAvatarChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlaceholderAvatar = (text: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(text)}`;
  };

  const displayUrl = avatarUrl || generatePlaceholderAvatar(name);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadAvatarToCloudinary(file);

      // Save URL to Firestore
      await saveUserAvatar(uid, cloudinaryUrl);

      // Update parent component
      onAvatarChange(cloudinaryUrl);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-teal-400 shadow-md hover:border-teal-600 transition cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={displayUrl}
          alt={name}
          className="w-full h-full object-cover bg-gray-200"
        />
        
        {/* Camera Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <Camera size={24} className="text-white" />
        </div>

        {/* Loading Indicator */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>
      )}

      <p className="text-xs text-gray-500 text-center">Click to upload photo</p>
    </div>
  );
};

export default ProfileAvatar;
