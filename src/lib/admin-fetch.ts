/**
 * adminFetch — A thin wrapper around the native fetch that automatically
 * attaches the Authorization: Bearer <token> header from localStorage.
 *
 * This ensures that every API call from the admin dashboard includes the
 * token even when HttpOnly cookies are stripped by a reverse proxy.
 *
 * Usage:
 *   import { adminFetch } from '@/lib/admin-fetch'
 *   const res = await adminFetch('/api/admin/stats')
 *   const data = await res.json()
 */

export async function adminFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const headers = new Headers(options.headers)

  // Set Content-Type for JSON string bodies if not already set
  // (don't override when body is FormData — the browser sets the correct
  //  multipart boundary automatically)
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Attach the Authorization header as a fallback
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, { ...options, headers })
}

/**
 * Convenience: clear the stored admin token (e.g. after logout).
 */
export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token')
  }
}
