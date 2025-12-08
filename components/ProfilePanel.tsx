import React, { ChangeEvent, useEffect, useState } from 'react';
import { Profile } from '../hooks/useProfile';

interface ProfilePanelProps {
  profile: Profile;
  onClose: () => void;
  onSave: (partial: Partial<Profile>) => Promise<void> | void;
  onUploadAvatar: (file: File) => Promise<void> | void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  saving?: boolean;
  savingPassword?: boolean;
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
  onChangePassword,
  saving,
  savingPassword,
}) => {
  const [formValues, setFormValues] = useState<Profile>(profile);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormValues(profile);
  }, [profile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadAvatar(file);
  };

  const handleInputChange = (key: keyof Profile, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave(formValues);
  };

  const handlePasswordChange = async () => {
    setPasswordMessage(null);
    if (!currentPassword || !newPassword) {
      setPasswordMessage('Please enter both current and new password.');
      return;
    }
    try {
      await onChangePassword(currentPassword, newPassword);
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage(err?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ×
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-teal-200">
              <img
                src={
                  formValues.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${formValues.name || 'Guest'}`
                }
                alt="Avatar"
                className="w-full h-full object-cover bg-gray-100"
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
                value={formValues[key] as string | number}
                onChange={(e) =>
                  handleInputChange(key, type === 'number' ? Number(e.target.value) : e.target.value)
                }
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-teal-600 text-white rounded-2xl font-semibold hover:bg-teal-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Change Password</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="w-full py-2 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-black transition disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
            {passwordMessage && (
              <p className="text-xs text-center text-gray-600">{passwordMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
