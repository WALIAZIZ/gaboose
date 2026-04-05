'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If there's already a valid token in localStorage, skip login and go to /admin
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      // Verify the token is still valid by calling /api/admin/me
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (res.ok) router.push('/admin?t=1')
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('admin_token')
        })
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store token in localStorage for proxy compatibility
      if (data.token) {
        localStorage.setItem('admin_token', data.token)
      }

      toast.success('Welcome back!')

      // Use ?t=1 hint so the middleware knows the client has a token
      // and will let the request through even if the cookie is stripped by the proxy
      router.push('/admin?t=1')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#08080A' }}>
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #C4A03C 1px, transparent 1px), radial-gradient(circle at 75% 75%, #C4A03C 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Card
        className="relative w-full max-w-md mx-4 border shadow-2xl"
        style={{
          backgroundColor: '#111114',
          borderColor: '#1E1E24',
        }}
      >
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(196, 160, 60, 0.15)' }}>
            <Building2 className="w-8 h-8" style={{ color: '#C4A03C' }} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: '#C4A03C' }}>
              Gaboose Hotel
            </CardTitle>
            <CardDescription className="mt-1" style={{ color: '#A09890' }}>
              Admin Dashboard Login
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md text-sm text-red-400 border border-red-500/30 bg-red-500/10">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" style={{ color: '#B8B0A4' }}>Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
                style={{
                  backgroundColor: '#08080A',
                  borderColor: '#1E1E24',
                  color: '#fff',
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#B8B0A4' }}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  style={{
                    backgroundColor: '#08080A',
                    borderColor: '#1E1E24',
                    color: '#fff',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#A09890' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-black transition-all hover:brightness-110"
              style={{ backgroundColor: '#C4A03C' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: '#1E1E24' }}>
            <p className="text-xs text-center" style={{ color: '#A09890' }}>
              Secure admin access only. Unauthorized access is prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
