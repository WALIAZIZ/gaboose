'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, RefreshCw, Upload, ImageIcon, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

interface HotelImage {
  id: string; title: string; category: string; imageUrl: string; sortOrder: number
}

const categories = ['gallery', 'hotel', 'room', 'restaurant']

async function apiCall(url: string, options?: RequestInit) {
  const res = await adminFetch(url, options)
  if (!res.ok) {
    let errorMsg = 'Request failed'
    try { const data = await res.json(); errorMsg = data.error || data.message || errorMsg } catch { /* use default */ }
    throw new Error(errorMsg)
  }
  return res.json()
}

export default function GalleryPage() {
  const [images, setImages] = useState<HotelImage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newImage, setNewImage] = useState({ title: '', category: 'gallery', imageUrl: '', sortOrder: '0' })

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? `?category=${filter}` : ''
      const res = await adminFetch(`/api/admin/gallery${params}`)
      if (res.ok) { const data = await res.json(); setImages(Array.isArray(data) ? data : []) } else { toast.error('Failed to fetch images') }
    } catch (err: any) { toast.error(err.message || 'Failed to fetch images') } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchImages() }, [fetchImages])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      if (res.ok) { const data = await res.json(); setNewImage({ ...newImage, imageUrl: data.url }); toast.success('Image uploaded') }
      else { const data = await res.json().catch(() => ({})); toast.error(data.error || 'Upload failed') }
    } catch (err: any) { toast.error(err.message || 'Upload failed') } finally { setUploading(false) }
  }

  async function handleAdd() {
    if (!newImage.imageUrl) { toast.error('Please upload an image'); return }
    if (!newImage.title) { toast.error('Please enter a title'); return }
    setSaving(true)
    try {
      await apiCall('/api/admin/gallery', { method: 'POST', body: JSON.stringify({ title: newImage.title, category: newImage.category, imageUrl: newImage.imageUrl, sortOrder: parseInt(newImage.sortOrder) || 0 }) })
      toast.success('Image added'); setDialogOpen(false); setNewImage({ title: '', category: 'gallery', imageUrl: '', sortOrder: '0' }); fetchImages()
    } catch (err: any) { toast.error(err.message || 'Failed to add image') } finally { setSaving(false) }
  }

  async function deleteImage(id: string) {
    if (!confirm('Delete this image?')) return
    try { await apiCall(`/api/admin/gallery/${id}`, { method: 'DELETE' }); toast.success('Image deleted'); fetchImages() } catch (err: any) { toast.error(err.message || 'Failed to delete') }
  }

  async function updateCategory(id: string, category: string) {
    try { const img = images.find((i) => i.id === id); if (!img) return; await apiCall(`/api/admin/gallery/${id}`, { method: 'PUT', body: JSON.stringify({ ...img, category }) }); fetchImages() } catch (err: any) { toast.error(err.message || 'Failed to update') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Gallery</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{images.length} images</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}><SelectValue /></SelectTrigger>
            <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}><SelectItem value="all">All</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchImages} style={{ borderColor: '#1E1E24', color: '#A09890' }}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button size="sm" onClick={() => setDialogOpen(true)} style={{ backgroundColor: '#C4A03C', color: '#000' }}><Plus className="w-4 h-4 mr-2" /> Add Image</Button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" style={{ backgroundColor: '#111114' }} />)}</div>
      ) : images.length === 0 ? (
        <Card style={cardStyle}><CardContent className="text-center py-16" style={{ color: '#A09890' }}><ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>No images yet. Click &quot;Add Image&quot; to upload.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="group overflow-hidden" style={cardStyle}>
              <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#08080A' }}>
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"><Button size="sm" variant="ghost" className="h-9 w-9 p-0 bg-red-600/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteImage(img.id)}><Trash2 className="w-4 h-4 text-white" /></Button></div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" style={{ color: '#fff' }}>{img.title || 'Untitled'}</p>
                <Select value={img.category} onValueChange={(v) => updateCategory(img.id, v)}>
                  <SelectTrigger className="h-7 mt-2 text-xs" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#A09890' }}><SelectValue /></SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>{categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader><DialogTitle style={{ color: '#fff' }}>Add New Image</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label style={{ color: '#B8B0A4' }}>Title *</Label><Input value={newImage.title} onChange={(e) => setNewImage({ ...newImage, title: e.target.value })} placeholder="Image title" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} /></div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Category</Label>
              <Select value={newImage.category} onValueChange={(v) => setNewImage({ ...newImage, category: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}><SelectValue /></SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>{categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Image *</Label>
              {newImage.imageUrl ? (<div className="relative w-full h-48 rounded-lg overflow-hidden"><img src={newImage.imageUrl} alt="preview" className="w-full h-full object-cover" /><button onClick={() => setNewImage({ ...newImage, imageUrl: '' })} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></button></div>) : (
                <label className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed cursor-pointer" style={{ borderColor: '#1E1E24', backgroundColor: '#08080A' }}>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  {uploading ? (<div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: '#C4A03C', borderTopColor: 'transparent' }} />) : (<><Upload className="w-8 h-8 mb-2" style={{ color: '#A09890' }} /><span className="text-sm" style={{ color: '#A09890' }}>Click to upload (max 5MB)</span></>)}
                </label>
              )}
            </div>
            <div className="space-y-2"><Label style={{ color: '#B8B0A4' }}>Sort Order</Label><Input type="number" value={newImage.sortOrder} onChange={(e) => setNewImage({ ...newImage, sortOrder: e.target.value })} style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} /></div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} disabled={saving} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>{saving ? 'Saving...' : 'Add Image'}</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}