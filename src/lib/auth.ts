import bcrypt from 'bcryptjs'
import { db } from './db'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'gaboose-hotel-secret-key-change-in-production'

export interface AuthUser {
  id: string
  username: string
  name: string
  role: string
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  const admin = await db.admin.findUnique({ where: { username } })
  if (!admin) return null
  
  const isValid = await bcrypt.compare(password, admin.password)
  if (!isValid) return null
  
  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    role: admin.role,
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

/**
 * Extract auth token from request — checks HttpOnly cookie first,
 * then falls back to the Authorization: Bearer <token> header.
 * This ensures compatibility with proxies that may strip cookies.
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  // 1. Try HttpOnly cookie
  const cookieToken = request.cookies.get('admin_token')?.value
  if (cookieToken) {
    const user = verifyToken(cookieToken)
    if (user) return user
  }

  // 2. Fallback: Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7)
    const user = verifyToken(bearerToken)
    if (user) return user
  }

  return null
}
