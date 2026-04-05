'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Search, Filter, CalendarDays, Phone, Mail, Users, Clock,
  CheckCircle2, XCircle, Eye, Trash2, RefreshCw, CreditCard, ImageIcon, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(234,179,8,0.12)', color: '#EAB308', label: 'Pending' },
  confirmed: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Confirmed' },
  completed: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Completed' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Cancelled' },
}

const paymentStatusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(234,179,8,0.12)', color: '#EAB308', label: 'Awaiting' },
  partial: { bg: 'rgba(249,115,22,0.12)', color: '#F97316', label: 'Partial' },
  paid: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Paid' },
  overpaid: { bg: 'rgba(168,85,247,0.12)', color: '#A855F7', label: 'Overpaid' },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await adminFetch(`/api/admin/bookings?${params}`)
      if (res.ok) setBookings(await res.json())
    } catch {
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function updateStatus(id: string, status: string) {
    try {
      const res = await adminFetch('/api/admin/bookings', {
        method: 'PUT',
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        toast.success(`Booking ${status}`)
        fetchBookings()
      }
    } catch {
      toast.error('Failed to update booking')
    }
  }

  async function deleteBooking(id: string) {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      const res = await adminFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Booking deleted')
        fetchBookings()
      }
    } catch {
      toast.error('Failed to delete booking')
    }
  }

  async function openBookingDetail(booking: any) {
    // Fetch booking with payment proof
    try {
      const res = await adminFetch(`/api/admin/bookings/${booking.id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedBooking(data)
      } else {
        setSelectedBooking(booking)
      }
    } catch {
      setSelectedBooking(booking)
    }
    setDialogOpen(true)
  }

  async function verifyPayment(verified: boolean) {
    if (!selectedBooking) return

    if (!verified && !rejectNotes.trim()) {
      toast.error('Please provide rejection notes')
      return
    }

    setVerifying(true)
    try {
      const res = await adminFetch(`/api/admin/bookings/${selectedBooking.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ verified, notes: verified ? 'Payment verified' : rejectNotes }),
      })
      if (res.ok) {
        toast.success(verified ? 'Payment verified!' : 'Payment rejected')
        setDialogOpen(false)
        setShowRejectDialog(false)
        setRejectNotes('')
        fetchBookings()
      } else {
        toast.error('Failed to verify payment')
      }
    } catch {
      toast.error('Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Bookings</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{bookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card style={cardStyle}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A09890' }} />
              <Input
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                <Filter className="w-4 h-4 mr-2" style={{ color: '#A09890' }} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card style={cardStyle}>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" style={{ backgroundColor: '#08080A' }} />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#A09890' }}>
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E24' }}>
                    {['Guest', 'Phone', 'Room', 'Check-in', 'Check-out', 'Guests', 'Status', 'Payment', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#A09890' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const sc = statusConfig[b.status] || statusConfig.pending
                    const pc = paymentStatusConfig[b.paymentStatus] || paymentStatusConfig.pending
                    return (
                      <tr
                        key={b.id}
                        className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: '1px solid #1E1E24' }}
                        onClick={() => openBookingDetail(b)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#fff' }}>{b.name}</p>
                            {b.email && <p className="text-xs" style={{ color: '#A09890' }}>{b.email}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{b.phone}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{b.roomType}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{formatDate(b.checkIn)}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{formatDate(b.checkOut)}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{b.guests}</td>
                        <td className="px-4 py-3">
                          <Badge className="text-[10px] px-2 py-0.5" style={{ backgroundColor: sc.bg, color: sc.color }}>
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-[10px] px-2 py-0.5" style={{ backgroundColor: pc.bg, color: pc.color }}>
                            {pc.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {b.status === 'pending' && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" style={{ color: '#3B82F6' }}
                                onClick={() => updateStatus(b.id, 'confirmed')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                              </Button>
                            )}
                            {b.status === 'confirmed' && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" style={{ color: '#22C55E' }}
                                onClick={() => updateStatus(b.id, 'completed')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                              </Button>
                            )}
                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" style={{ color: '#EF4444' }}
                                onClick={() => updateStatus(b.id, 'cancelled')}>
                                <XCircle className="w-3 h-3 mr-1" /> Cancel
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" style={{ color: '#EF4444' }}
                              onClick={() => deleteBooking(b.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Guest', value: selectedBooking.name, icon: Users },
                  { label: 'Email', value: selectedBooking.email || '-', icon: Mail },
                  { label: 'Phone', value: selectedBooking.phone, icon: Phone },
                  { label: 'Room Type', value: selectedBooking.roomType, icon: CalendarDays },
                  { label: 'Check-in', value: formatDate(selectedBooking.checkIn), icon: Clock },
                  { label: 'Check-out', value: formatDate(selectedBooking.checkOut), icon: Clock },
                  { label: 'Guests', value: String(selectedBooking.guests), icon: Users },
                  { label: 'Booking Status', value: selectedBooking.status, icon: Eye },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                    <p className="text-xs flex items-center gap-1.5 mb-1" style={{ color: '#A09890' }}>
                      <Icon className="w-3 h-3" /> {label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#fff' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Payment Status */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                <p className="text-xs flex items-center gap-1.5 mb-1" style={{ color: '#A09890' }}>
                  <CreditCard className="w-3 h-3" /> Payment Status
                </p>
                <Badge className="text-[10px] px-2 py-0.5" style={{
                  backgroundColor: (paymentStatusConfig[selectedBooking.paymentStatus] || paymentStatusConfig.pending).bg,
                  color: (paymentStatusConfig[selectedBooking.paymentStatus] || paymentStatusConfig.pending).color,
                }}>
                  {(paymentStatusConfig[selectedBooking.paymentStatus] || paymentStatusConfig.pending).label}
                </Badge>
                {selectedBooking.totalAmount && (
                  <p className="text-sm mt-2" style={{ color: '#fff' }}>
                    Total: <span style={{ color: '#C4A03C' }}>{selectedBooking.totalAmount} ETB</span>
                  </p>
                )}
              </div>

              {/* Payment Proof */}
              {selectedBooking.paymentProof && (
                <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(196,160,60,0.05)', border: '1px solid rgba(196,160,60,0.15)' }}>
                  <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#C4A03C' }}>
                    <ImageIcon className="w-4 h-4" /> Payment Proof
                  </p>

                  {/* Proof Image */}
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #1E1E24' }}>
                    <img
                      src={selectedBooking.paymentProof.imageUrl}
                      alt="Payment proof"
                      className="w-full max-h-64 object-contain"
                      style={{ backgroundColor: '#08080A' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded" style={{ backgroundColor: '#08080A' }}>
                      <p className="text-[10px]" style={{ color: '#A09890' }}>Sender</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{selectedBooking.paymentProof.senderName}</p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: '#08080A' }}>
                      <p className="text-[10px]" style={{ color: '#A09890' }}>Amount</p>
                      <p className="text-sm" style={{ color: '#fff' }}>
                        {selectedBooking.paymentProof.amount ? `${selectedBooking.paymentProof.amount} ETB` : 'Not specified'}
                      </p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: '#08080A' }}>
                      <p className="text-[10px]" style={{ color: '#A09890' }}>Account</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{selectedBooking.paymentProof.accountName || 'Not specified'}</p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: '#08080A' }}>
                      <p className="text-[10px]" style={{ color: '#A09890' }}>Submitted</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{formatDate(selectedBooking.paymentProof.createdAt)}</p>
                    </div>
                  </div>

                  {selectedBooking.paymentProof.notes && (
                    <div className="p-2 rounded" style={{ backgroundColor: '#08080A' }}>
                      <p className="text-[10px]" style={{ color: '#A09890' }}>Notes</p>
                      <p className="text-sm" style={{ color: '#fff' }}>{selectedBooking.paymentProof.notes}</p>
                    </div>
                  )}

                  {selectedBooking.paymentProof.verified && (
                    <div className="p-2 rounded flex items-center gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
                      <span className="text-sm" style={{ color: '#22C55E' }}>
                        Verified by {selectedBooking.paymentProof.verifiedBy}
                        {selectedBooking.paymentProof.verifiedAt && ` on ${formatDate(selectedBooking.paymentProof.verifiedAt)}`}
                      </span>
                    </div>
                  )}

                  {/* Verify / Reject Buttons */}
                  {!selectedBooking.paymentProof.verified && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => verifyPayment(true)}
                        disabled={verifying}
                        className="flex-1"
                        style={{ backgroundColor: '#22C55E', color: '#000' }}
                      >
                        {verifying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                        ✅ Verify Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={verifying}
                        className="flex-1"
                        style={{ borderColor: '#EF4444', color: '#EF4444' }}
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {selectedBooking.notes && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#08080A' }}>
                  <p className="text-xs mb-1" style={{ color: '#A09890' }}>Special Notes</p>
                  <p className="text-sm" style={{ color: '#fff' }}>{selectedBooking.notes}</p>
                </div>
              )}
              <p className="text-xs" style={{ color: '#A09890' }}>
                Booked on {formatDate(selectedBooking.createdAt)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>Reject Payment</DialogTitle>
            <DialogDescription style={{ color: '#A09890' }}>
              Please provide a reason for rejecting this payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Rejection Reason *</Label>
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Why are you rejecting this payment?"
                rows={3}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => verifyPayment(false)}
                disabled={verifying}
                className="flex-1"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}
              >
                {verifying ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowRejectDialog(false); setRejectNotes('') }}
                style={{ borderColor: '#1E1E24', color: '#A09890' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
