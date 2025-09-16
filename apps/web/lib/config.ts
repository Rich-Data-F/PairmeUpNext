export function getApiBase() {
  const explicit = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (explicit) return explicit;
  // Safe defaults
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4000';
  // Match actual Render service URL (not the yaml name)
  return 'https://pairmeup.onrender.com';
}
