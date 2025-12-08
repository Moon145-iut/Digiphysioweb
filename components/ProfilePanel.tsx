import React, { ChangeEvent } from 'react';
import { Profile } from '../hooks/useProfile';

interface ProfilePanelProps {
  profile: Profile;
  onClose: () => void;
  onSave: (partial: Partial<Profile>) => void;
  onUploadAvatar: (file: File) => void;
}

const fields: { key: keyof Profile; label: string; type?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'painArea', label: 'Pain Area' },
  { key: 'goal', label: 'Goal' },
];

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  profile,
  onClose,
  onSave,
  onUploadAvatar,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadAvatar(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-teal-200">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Guest'}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="text-sm font-medium text-teal-600 cursor-pointer">
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
              <input
                type={type || 'text'}
                defaultValue={profile[key] as string | number}
                onBlur={(e) => onSave({ [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
