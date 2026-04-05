'use client'

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Building2, LayoutDashboard, CalendarDays, BedDouble, UtensilsCrossed,
  ImageIcon, MessageSquare, DollarSign, FileText, StickyNote, Settings,
  LogOut, Menu, X, ChevronRight, Shield, UserCog, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { adminFetch, clearAdminToken } from '@/lib/admin-fetch'

interface AdminUser {
  id: string
  username: string
  name: string
  role: string
}

const AdminContext = createContext<{ user: AdminUser | null }>({ user: null })

export function useAdmin() {
  return useContext(AdminContext)
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/finances', label: 'Finances', icon: DollarSign },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/notes', label: 'Notes', icon: StickyNote },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const authChecked = useRef(false)

  useEffect(() => {
    // Skip auth check on the login page itself
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    // Only check auth once — don't re-check on every navigation
    if (authChecked.current) {
      setLoading(false)
      return
    }
    authChecked.current = true

    async function checkAuth() {
      try {
        const res = await adminFetch('/api/admin/me')
        if (!res.ok) {
          // Not authenticated — redirect to login
          clearAdminToken()
          router.push('/admin/login')
          return
        }
        const userData = await res.json()
        setUser(userData)
      } catch {
        clearAdminToken()
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  async function handleLogout() {
    try {
      // Call the server-side logout endpoint (clears cookie)
      await fetch('/api/admin/auth', { method: 'DELETE' })
      // Also clear the client-side token
      clearAdminToken()
      setUser(null)
      toast.success('Logged out successfully')
      router.push('/admin/login')
    } catch {
      toast.error('Failed to logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08080A' }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: '#C4A03C', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // Don't render the admin shell on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <AdminContext.Provider value={{ user }}>
      <div className="min-h-screen flex" style={{ backgroundColor: '#08080A' }}>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: '#111114', borderRight: '1px solid #1E1E24' }}
        >
          <div className="flex items-center justify-between p-4 h-16">
            <Link href="/admin" className="flex items-center gap-2">
              <Building2 className="w-6 h-6" style={{ color: '#C4A03C' }} />
              <span className="font-bold text-lg" style={{ color: '#C4A03C' }}>Gaboose</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              style={{ color: '#A09890' }}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator style={{ backgroundColor: '#1E1E24' }} />

          <ScrollArea className="flex-1 py-2">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
                    style={{
                      backgroundColor: isActive ? 'rgba(196, 160, 60, 0.12)' : 'transparent',
                      color: isActive ? '#C4A03C' : '#A09890',
                    }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t" style={{ borderColor: '#1E1E24' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(196, 160, 60, 0.15)' }}>
                <UserCog className="w-4 h-4" style={{ color: '#C4A03C' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#fff' }}>{user?.name || 'Admin'}</p>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ borderColor: '#C4A03C', color: '#C4A03C' }}
                >
                  {user?.role === 'admin' ? (
                    <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> Admin</span>
                  ) : (
                    'Employee'
                  )}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              style={{ color: '#A09890' }}
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header
            className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6"
            style={{ backgroundColor: '#111114', borderBottom: '1px solid #1E1E24' }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              style={{ color: '#A09890' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium" style={{ color: '#B8B0A4' }}>
                {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-1 text-xs"
                style={{ borderColor: '#1E1E24', color: '#A09890' }}
              >
                <Building2 className="w-3 h-3" />
                Gaboose Admin
              </Badge>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}
