/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_REGISTRATION_FEE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_BUCKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
