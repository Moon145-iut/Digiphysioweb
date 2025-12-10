/**
 * Avatar Upload Service
 * Uploads user profile photos to Cloudinary using unsigned uploads
 * No API secret needed in frontend
 */

const CLOUD_NAME = 'dra4ykviv';
const UPLOAD_PRESET = 'my_upload_preset';
const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadAvatarToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'profile_avatars');

  try {
    const response = await fetch(CLOUDINARY_API, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}
