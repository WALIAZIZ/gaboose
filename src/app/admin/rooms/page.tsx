'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus, Edit, Trash2, RefreshCw, Upload, Image as ImageIcon, BedDouble,
  Eye, EyeOff, X, ChevronUp, ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

interface Room {
  id: string
  name: string
  nameSo: string
  description: string
  descriptionSo: string
  price: number
  image: string
  features: string
  maxGuests: number
  available: boolean
  sortOrder: number
}

const emptyRoom = {
  name: '', nameSo: '', description: '', descriptionSo: '', price: '', image: '',
  features: '', maxGuests: '2', available: true, sortOrder: '0',
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyRoom)
  const [uploading, setUploading] = useState(false)

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/rooms')
      if (res.ok) setRooms(await res.json())
    } catch { toast.error('Failed to fetch rooms') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  function parseFeatures(f: string): string[] {
    try { return JSON.parse(f) } catch { return [] }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, image: data.url })
        toast.success('Image uploaded')
      }
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyRoom)
    setDialogOpen(true)
  }

  function openEdit(room: Room) {
    setEditId(room.id)
    setForm({
      name: room.name,
      nameSo: room.nameSo,
      description: room.description,
      descriptionSo: room.descriptionSo,
      price: String(room.price),
      image: room.image,
      features: room.features,
      maxGuests: String(room.maxGuests),
      available: room.available,
      sortOrder: String(room.sortOrder),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }

    const features = form.features.split(',').map((f) => f.trim()).filter(Boolean)
    const body = {
      name: form.name, nameSo: form.nameSo, description: form.description,
      descriptionSo: form.descriptionSo, price: form.price, image: form.image,
      features, maxGuests: form.maxGuests, available: form.available, sortOrder: form.sortOrder,
    }

    try {
      const url = editId ? `/api/admin/rooms/${editId}` : '/api/admin/rooms'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editId ? 'Room updated' : 'Room created')
        setDialogOpen(false)
        fetchRooms()
      }
    } catch { toast.error('Failed to save room') }
  }

  async function deleteRoom(id: string) {
    if (!confirm('Delete this room?')) return
    try {
      const res = await adminFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Room deleted'); fetchRooms() }
    } catch { toast.error('Failed to delete room') }
  }

  async function toggleAvailable(room: Room) {
    try {
      const res = await adminFetch(`/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...room, features: parseFeatures(room.features) }),
      })
      if (res.ok) fetchRooms()
    } catch { toast.error('Failed to update room') }
  }

  async function moveSort(room: Room, direction: 'up' | 'down') {
    try {
      await adminFetch(`/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...room,
          features: parseFeatures(room.features),
          sortOrder: room.sortOrder + (direction === 'up' ? -1 : 1),
        }),
      })
      fetchRooms()
    } catch { toast.error('Failed to reorder') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Rooms</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{rooms.length} rooms total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRooms} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Room
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" style={{ backgroundColor: '#111114' }} />)}
        </div>
      ) : rooms.length === 0 ? (
        <Card style={cardStyle}>
          <CardContent className="text-center py-16" style={{ color: '#A09890' }}>
            <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No rooms yet. Click &quot;Add Room&quot; to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="group" style={cardStyle}>
              <div className="relative h-40 rounded-t-xl overflow-hidden" style={{ backgroundColor: '#08080A' }}>
                {room.image ? (
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8" style={{ color: '#1E1E24' }} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-black/60 hover:bg-black/80"
                    onClick={() => openEdit(room)}>
                    <Edit className="w-3.5 h-3.5 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-black/60 hover:bg-red-600/80"
                    onClick={() => deleteRoom(room.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </Button>
                </div>
                {!room.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge style={{ backgroundColor: 'rgba(239,68,68,0.9)', color: '#fff' }}>Unavailable</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold" style={{ color: '#fff' }}>{room.name}</h3>
                    {room.nameSo && <p className="text-xs" style={{ color: '#A09890' }}>{room.nameSo}</p>}
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#C4A03C' }}>{room.price} ETB</p>
                </div>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: '#A09890' }}>{room.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {parseFeatures(room.features).slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                      {f}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #1E1E24' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#A09890' }}>Available</span>
                    <Switch checked={room.available} onCheckedChange={() => toggleAvailable(room)} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSort(room, 'up')}>
                      <ChevronUp className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSort(room, 'down')}>
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>{editId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Name (English) *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Name (Somali)</Label>
                <Input value={form.nameSo} onChange={(e) => setForm({ ...form, nameSo: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Description (English)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Description (Somali)</Label>
              <Textarea value={form.descriptionSo} onChange={(e) => setForm({ ...form, descriptionSo: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Price (ETB) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Max Guests</Label>
                <Input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Features (comma-separated)</Label>
              <Input placeholder="WiFi, AC, TV, Minibar"
                value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Room Image</Label>
              <div className="flex gap-3 items-center">
                {form.image && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, image: '' })}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed"
                    style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
              <Label style={{ color: '#B8B0A4' }}>Available for booking</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {editId ? 'Update Room' : 'Create Room'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
