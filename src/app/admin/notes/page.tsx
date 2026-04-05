'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit, Trash2, RefreshCw, StickyNote, Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

const priorityConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  low: { bg: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '#3B82F6', label: 'Low' },
  normal: { bg: 'rgba(156,163,175,0.08)', color: '#9CA3AF', border: '#9CA3AF', label: 'Normal' },
  high: { bg: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '#EAB308', label: 'High' },
  urgent: { bg: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '#EF4444', label: 'Urgent' },
}

interface Note {
  id: string
  title: string
  content: string
  priority: string
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' })
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date')

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/notes')
      if (res.ok) setNotes(await res.json())
    } catch { toast.error('Failed to fetch notes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'priority') return (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  function openCreate() {
    setEditId(null)
    setForm({ title: '', content: '', priority: 'normal' })
    setDialogOpen(true)
  }

  function openEdit(note: Note) {
    setEditId(note.id)
    setForm({ title: note.title, content: note.content, priority: note.priority })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title) { toast.error('Title is required'); return }
    try {
      if (editId) {
        const res = await adminFetch('/api/admin/notes', {
          method: 'PUT',
          body: JSON.stringify({ id: editId, ...form }),
        })
        if (res.ok) { toast.success('Note updated'); setDialogOpen(false); fetchNotes() }
      } else {
        const res = await adminFetch('/api/admin/notes', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        if (res.ok) { toast.success('Note created'); setDialogOpen(false); fetchNotes() }
      }
    } catch { toast.error('Failed to save note') }
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this note?')) return
    try {
      const res = await adminFetch('/api/admin/notes', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.success('Note deleted'); fetchNotes() }
    } catch { toast.error('Failed to delete') }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Notes</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{notes.length} notes · Decision-making board</p>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-32" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="priority">By Priority</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchNotes} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Note
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" style={{ backgroundColor: '#111114' }} />)}
        </div>
      ) : notes.length === 0 ? (
        <Card style={cardStyle}>
          <CardContent className="text-center py-16" style={{ color: '#A09890' }}>
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No notes yet. Create your first note to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sortedNotes.map((note) => {
              const pc = priorityConfig[note.priority] || priorityConfig.normal
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="h-full" style={{ ...cardStyle, borderLeft: `3px solid ${pc.border}` }}>
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm" style={{ color: '#fff' }}>{note.title}</h3>
                        <Badge className="text-[10px] shrink-0 px-1.5 py-0" style={{ backgroundColor: pc.bg, color: pc.color }}>
                          {pc.label}
                        </Badge>
                      </div>
                      <p className="text-sm flex-1 line-clamp-4 mb-3" style={{ color: '#A09890' }}>
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #1E1E24' }}>
                        <span className="text-[11px]" style={{ color: '#4A4640' }}>{formatDate(note.createdAt)}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(note)}>
                            <Edit className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteNote(note.id)}>
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>{editId ? 'Edit Note' : 'New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                  {Object.entries(priorityConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Note title" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your note..." rows={5}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                <Save className="w-4 h-4 mr-2" /> {editId ? 'Update' : 'Create'} Note
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
