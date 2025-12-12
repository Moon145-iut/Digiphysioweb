const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'profile-avatars';

const ensureConfig = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase storage is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};

const buildFilePath = (userId: string, ext: string) => {
  const safeUser = userId.replace(/[^a-zA-Z0-9-_]/g, '_') || 'user';
  return `${safeUser}/${Date.now()}.${ext}`;
};

export async function uploadAvatarToSupabase(file: File, userId: string): Promise<string> {
  ensureConfig();

  const extension =
    file.name.split('.').pop() ||
    file.type.split('/').pop() ||
    'jpg';

  const filePath = buildFilePath(userId, extension);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Supabase upload failed: ${response.status} ${errorText}`.trim());
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filePath}`;
}
