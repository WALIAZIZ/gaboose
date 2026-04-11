import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (process.env.DATABASE_URL) {
    const neon = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaNeon(neon)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
