'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CalendarDays, MessageSquare, DollarSign, BedDouble, Users,
  ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp,
  Database, Loader2, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminFetch } from '@/lib/admin-fetch'

interface Stats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  todayCheckIns: number
  unreadMessages: number
  totalRooms: number
  availableRooms: number
  monthRevenue: number
  recentBookings: any[]
  totalNotes: number
}

interface FinanceData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyBreakdown: { month: string; revenue: number; expenses: number; profit: number }[]
}

interface ContentStatus {
  rooms: number
  menuItems: number
  galleryImages: number
  siteContent: number
  hasContent: boolean
}

const statusColors: Record<string, { bg: string; color: string; icon: any }> = {
  pending: { bg: 'rgba(234, 179, 8, 0.12)', color: '#EAB308', icon: Clock },
  confirmed: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', icon: CheckCircle2 },
  completed: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22C55E', icon: CheckCircle2 },
  cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', icon: XCircle },
}

const cardStyle = {
  backgroundColor: '#111114',
  borderColor: '#1E1E24',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [finance, setFinance] = useState<FinanceData | null>(null)
  const [contentStatus, setContentStatus] = useState<ContentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, financeRes, contentRes] = await Promise.all([
          adminFetch('/api/admin/stats'),
          adminFetch('/api/admin/finances/summary'),
          adminFetch('/api/admin/seed-content'),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (financeRes.ok) setFinance(await financeRes.json())
        if (contentRes.ok) setContentStatus(await contentRes.json())
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSeedContent = async () => {
    setSeeding(true)
    setSeedMessage('')
    try {
      const res = await adminFetch('/api/admin/seed-content', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSeedMessage(`Seeded: ${data.results.rooms} rooms, ${data.results.menuItems} menu items, ${data.results.galleryImages} gallery images, ${data.results.siteContent} site settings`)
        // Refresh content status
        const contentRes = await adminFetch('/api/admin/seed-content')
        if (contentRes.ok) setContentStatus(await contentRes.json())
      } else {
        const data = await res.json()
        setSeedMessage(`Error: ${data.error || 'Failed to seed'}`)
      }
    } catch (err: any) {
      setSeedMessage(`Error: ${err.message}`)
    } finally {
      setSeeding(false)
    }
  }

  const statCards = stats
    ? [
        { title: 'Total Bookings', value: stats.totalBookings, icon: CalendarDays, color: '#C4A03C', href: '/admin/bookings' },
        { title: "Today's Check-ins", value: stats.todayCheckIns, icon: Users, color: '#22C55E', href: '/admin/bookings' },
        { title: 'Monthly Revenue', value: `$${stats.monthRevenue.toLocaleString()}`, icon: DollarSign, color: '#3B82F6', href: '/admin/finances' },
        { title: 'Pending Messages', value: stats.unreadMessages, icon: MessageSquare, color: '#F97316', href: '/admin/messages' },
      ]
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" style={{ backgroundColor: '#111114' }} />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" style={{ backgroundColor: '#111114' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Welcome Back</h1>
        <p className="mt-1" style={{ color: '#A09890' }}>Here&apos;s what&apos;s happening at Gaboose Hotel today.</p>
      </motion.div>

      {/* No Content Found Banner */}
      {contentStatus && !contentStatus.hasContent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5"
          style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}>
                <Database className="w-5 h-5" style={{ color: '#EAB308' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#EAB308' }}>No Website Content Found</h3>
                <p className="text-xs mt-0.5" style={{ color: '#A09890' }}>Your website has no rooms, menu, or gallery data. Load default content to get started.</p>
              </div>
            </div>
            <Button
              onClick={handleSeedContent}
              disabled={seeding}
              className="shrink-0"
              style={{ backgroundColor: '#EAB308', color: '#000', fontWeight: 600 }}
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Load Default Content
                </>
              )}
            </Button>
          </div>
          {seedMessage && (
            <p className="text-xs mt-3 px-1" style={{ color: seeding ? '#A09890' : '#22C55E' }}>{seedMessage}</p>
          )}
        </motion.div>
      )}

      {/* Content Status Bar (when content exists) */}
      {contentStatus && contentStatus.hasContent && (
        <div className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ backgroundColor: '#111114', border: '1px solid #1E1E24' }}>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#A09890' }}>
            <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {contentStatus.rooms} rooms</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-gray-600" /></span>
            <span>{contentStatus.menuItems} menu items</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-gray-600" /></span>
            <span>{contentStatus.galleryImages} gallery images</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-gray-600" /></span>
            <span>{contentStatus.siteContent} settings</span>
          </div>
          <button
            onClick={handleSeedContent}
            disabled={seeding}
            className="text-xs flex items-center gap-1 hover:underline"
            style={{ color: '#A09890' }}
          >
            <RefreshCw className={`w-3 h-3 ${seeding ? 'animate-spin' : ''}`} />
            Re-seed Defaults
          </button>
        </div>
      )}

      {/* Seed Message (after re-seed from status bar) */}
      {contentStatus && contentStatus.hasContent && seedMessage && (
        <p className="text-xs" style={{ color: '#22C55E' }}>{seedMessage}</p>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={card.href}>
                <Card className="group cursor-pointer transition-all hover:scale-[1.02]" style={cardStyle}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#A09890' }}>{card.title}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#fff' }}>{card.value}</p>
                      </div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${card.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: '#A09890' }}>
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Available Rooms', value: `${stats?.availableRooms || 0}/${stats?.totalRooms || 0}`, icon: BedDouble },
          { label: 'Confirmed', value: stats?.confirmedBookings || 0, icon: CheckCircle2 },
          { label: 'Pending', value: stats?.pendingBookings || 0, icon: AlertCircle },
          { label: 'Notes', value: stats?.totalNotes || 0, icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} style={cardStyle}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-4 h-4" style={{ color: '#C4A03C' }} />
                <div>
                  <p className="text-xs" style={{ color: '#A09890' }}>{item.label}</p>
                  <p className="text-lg font-bold" style={{ color: '#fff' }}>{item.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2" style={cardStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: '#fff' }}>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {finance?.monthlyBreakdown && finance.monthlyBreakdown.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finance.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                    <XAxis dataKey="month" tick={{ fill: '#A09890', fontSize: 11 }} axisLine={{ stroke: '#1E1E24' }} />
                    <YAxis tick={{ fill: '#A09890', fontSize: 11 }} axisLine={{ stroke: '#1E1E24' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111114',
                        border: '1px solid #1E1E24',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#A09890', fontSize: '12px' }} />
                    <Bar dataKey="revenue" fill="#C4A03C" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center" style={{ color: '#A09890' }}>
                No financial data yet. Add revenue and expenses to see charts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card style={cardStyle}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold" style={{ color: '#fff' }}>Recent Bookings</CardTitle>
              <Link href="/admin/bookings">
                <Button variant="ghost" size="sm" className="text-xs" style={{ color: '#C4A03C' }}>
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking: any) => {
                  const sc = statusColors[booking.status] || statusColors.pending
                  const StatusIcon = sc.icon
                  return (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: '#fff' }}>
                          {booking.name}
                        </span>
                        <Badge
                          className="text-[10px] px-1.5 py-0 flex items-center gap-1"
                          style={{ backgroundColor: sc.bg, color: sc.color }}
                        >
                          <StatusIcon className="w-2.5 h-2.5" />
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: '#A09890' }}>
                        <span>{booking.roomType}</span>
                        <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#A09890' }}>
                        {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-center py-8" style={{ color: '#A09890' }}>No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Summary */}
      {finance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: `$${finance.totalRevenue.toLocaleString()}`, color: '#22C55E' },
            { label: 'Total Expenses', value: `$${finance.totalExpenses.toLocaleString()}`, color: '#EF4444' },
            { label: 'Net Profit', value: `$${finance.netProfit.toLocaleString()}`, color: finance.netProfit >= 0 ? '#22C55E' : '#EF4444' },
          ].map((item) => (
            <Card key={item.label} style={cardStyle}>
              <CardContent className="p-5">
                <p className="text-sm" style={{ color: '#A09890' }}>{item.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}