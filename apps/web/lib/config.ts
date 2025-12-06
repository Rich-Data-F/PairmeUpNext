export function getApiBase() {
  const explicit = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (explicit) return explicit;
  // Safe defaults
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4000';
  // Default to Render-hosted API URL used in guides
  // NOTE: Best practice is to set NEXT_PUBLIC_API_URL in the Vercel project settings.
  // We intentionally log here to make it easy to diagnose deployments where
  // NEXT_PUBLIC_API_URL or API_BASE_URL are not set in the Vercel project.
  // This log appears in Vercel function logs and indicates the app is using
  // a safe default; however, you should still set the env var to your Render/Prod backend.
  const fallback = 'https://pairmeup.onrender.com';
  console.warn(`⚠️ NEXT_PUBLIC_API_URL / API_BASE_URL not set — falling back to ${fallback}`);
  return fallback;
}
