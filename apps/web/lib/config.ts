export function getApiBase() {
  const explicit = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (explicit) return explicit;
  // Safe defaults
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4000';
  // Match Render service name in render.yaml (name: pairmeup-api)
  return 'https://pairmeup-api.onrender.com';
}
