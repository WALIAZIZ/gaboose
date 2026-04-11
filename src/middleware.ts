import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const user = getAuthUser(request)

    if (!user) {
      // Don't redirect — the proxy may strip cookies.
      // Instead, let the request through and let the admin layout
      // handle auth client-side via localStorage + /api/admin/me.
      // The API routes themselves still verify auth (cookie or Authorization header).
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
