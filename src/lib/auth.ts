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
  // Try database first
  try {
    const admin = await db.admin.findUnique({ where: { username } })
    if (admin) {
      const isValid = await bcrypt.compare(password, admin.password)
      if (isValid) {
        return {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        }
      }
    }
  } catch (error) {
    console.error('DB auth failed, trying env vars:', error)
  }

  // Fallback to environment variables
  const envUser = process.env.ADMIN_USERNAME
  const envPass = process.env.ADMIN_PASSWORD

  if (envUser && envPass && username === envUser && password === envPass) {
    return {
      id: 'env-admin',
      username: envUser,
      name: 'Admin',
      role: 'admin',
    }
  }

  return null
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

export function getAuthUser(request: NextRequest): AuthUser | null {
  const cookieToken = request.cookies.get('admin_token')?.value
  if (cookieToken) {
    const user = verifyToken(cookieToken)
    if (user) return user
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7)
    const user = verifyToken(bearerToken)
    if (user) return user
  }

  return null
}