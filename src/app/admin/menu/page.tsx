'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus, Edit, Trash2, RefreshCw, ChevronUp, ChevronDown, UtensilsCrossed
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

interface MenuItem {
  id: string
  category: string
  name: string
  nameSo: string
  description: string
  descriptionSo: string
  price: number
  available: boolean
  sortOrder: number
}

const emptyItem = {
  name: '', nameSo: '', description: '', descriptionSo: '',
  price: '', category: 'breakfast', available: true, sortOrder: '0',
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('breakfast')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyItem)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/menu')
      if (res.ok) setItems(await res.json())
    } catch { toast.error('Failed to fetch menu items') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const breakfastItems = items.filter((i) => i.category === 'breakfast')
  const drinksItems = items.filter((i) => i.category === 'drinks')
  const activeItems = activeTab === 'breakfast' ? breakfastItems : drinksItems

  function openCreate(category: string) {
    setEditId(null)
    setForm({ ...emptyItem, category })
    setDialogOpen(true)
  }

  function openEdit(item: MenuItem) {
    setEditId(item.id)
    setForm({
      name: item.name, nameSo: item.nameSo, description: item.description,
      descriptionSo: item.descriptionSo, price: String(item.price),
      category: item.category, available: item.available, sortOrder: String(item.sortOrder),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    const body = {
      name: form.name, nameSo: form.nameSo, description: form.description,
      descriptionSo: form.descriptionSo, price: parseFloat(form.price),
      category: form.category, available: form.available, sortOrder: parseInt(form.sortOrder) || 0,
    }
    try {
      const url = editId ? `/api/admin/menu/${editId}` : '/api/admin/menu'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, body: JSON.stringify(body) })
      if (res.ok) { toast.success(editId ? 'Item updated' : 'Item created'); setDialogOpen(false); fetchItems() }
    } catch { toast.error('Failed to save') }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this menu item?')) return
    try {
      const res = await adminFetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Item deleted'); fetchItems() }
    } catch { toast.error('Failed to delete') }
  }

  async function toggleAvailable(item: MenuItem) {
    try {
      const res = await adminFetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item }),
      })
      if (res.ok) fetchItems()
    } catch { toast.error('Failed to update') }
  }

  async function moveSort(item: MenuItem, direction: 'up' | 'down') {
    try {
      await adminFetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...item, sortOrder: item.sortOrder + (direction === 'up' ? -1 : 1) }),
      })
      fetchItems()
    } catch { toast.error('Failed to reorder') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Menu Management</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{items.length} menu items total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={() => openCreate(activeTab)} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }} className="border">
          <TabsTrigger value="breakfast" className="data-[state=active]:text-yellow-400">
            🍳 Breakfast ({breakfastItems.length})
          </TabsTrigger>
          <TabsTrigger value="drinks" className="data-[state=active]:text-yellow-400">
            🥤 Drinks ({drinksItems.length})
          </TabsTrigger>
        </TabsList>

        {['breakfast', 'drinks'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" style={{ backgroundColor: '#111114' }} />)}
              </div>
            ) : activeItems.length === 0 ? (
              <Card style={cardStyle}>
                <CardContent className="text-center py-16" style={{ color: '#A09890' }}>
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No {tab} items yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 mt-4">
                {activeItems.map((item) => (
                  <Card key={item.id} style={cardStyle}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold" style={{ color: '#fff' }}>{item.name}</h3>
                            {item.nameSo && <span className="text-xs" style={{ color: '#A09890' }}>/ {item.nameSo}</span>}
                            {!item.available && (
                              <Badge className="text-[10px]" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>Hidden</Badge>
                            )}
                          </div>
                          <p className="text-sm mb-1" style={{ color: '#A09890' }}>{item.description}</p>
                          {item.descriptionSo && (
                            <p className="text-xs" style={{ color: '#5A5650' }}>{item.descriptionSo}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-xl font-bold" style={{ color: '#C4A03C' }}>{item.price} ETB</p>
                          <div className="flex flex-col gap-0.5">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSort(item, 'up')}>
                              <ChevronUp className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveSort(item, 'down')}>
                              <ChevronDown className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                            </Button>
                          </div>
                          <Switch checked={item.available} onCheckedChange={() => toggleAvailable(item)} />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(item)}>
                            <Edit className="w-4 h-4" style={{ color: '#A09890' }} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>{editId ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Price (ETB) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
              <Label style={{ color: '#B8B0A4' }}>Available on menu</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {editId ? 'Update Item' : 'Add Item'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
