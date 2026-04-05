'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  MessageSquare, Trash2, RefreshCw, Mail, Phone, Eye,
  CheckCheck, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/messages')
      if (res.ok) setMessages(await res.json())
    } catch { toast.error('Failed to fetch messages') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  async function markAsRead(id: string) {
    try {
      await adminFetch('/api/admin/messages', {
        method: 'PUT',
        body: JSON.stringify({ id, read: true }),
      })
      fetchMessages()
    } catch { toast.error('Failed to mark as read') }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    try {
      const res = await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Message deleted'); fetchMessages() }
    } catch { toast.error('Failed to delete') }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Messages</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMessages} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" style={{ backgroundColor: '#111114' }} />)}
        </div>
      ) : messages.length === 0 ? (
        <Card style={cardStyle}>
          <CardContent className="text-center py-16" style={{ color: '#A09890' }}>
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id
            return (
              <Card
                key={msg.id}
                className="cursor-pointer transition-all"
                style={{
                  ...cardStyle,
                  borderLeft: msg.read ? '3px solid #1E1E24' : '3px solid #C4A03C',
                }}
                onClick={() => {
                  setExpandedId(isExpanded ? null : msg.id)
                  if (!msg.read) markAsRead(msg.id)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate" style={{ color: msg.read ? '#B8B0A4' : '#fff' }}>
                          {msg.name}
                        </h3>
                        {!msg.read && (
                          <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: 'rgba(196, 160, 60, 0.15)', color: '#C4A03C' }}>
                            New
                          </Badge>
                        )}
                        {msg.subject && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                            {msg.subject}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs mb-1" style={{ color: '#A09890' }}>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</span>}
                      </div>
                      <p className="text-xs flex items-center gap-1" style={{ color: '#5A5650' }}>
                        <Clock className="w-3 h-3" />{formatDate(msg.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-7 px-2"
                        style={{ color: msg.read ? '#A09890' : '#C4A03C' }}
                        onClick={() => { if (!msg.read) markAsRead(msg.id) }}>
                        <CheckCheck className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" style={{ color: '#EF4444' }}
                        onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" style={{ color: '#A09890' }}
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1E1E24' }}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#B8B0A4' }}>
                        {msg.message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
