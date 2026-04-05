'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus, Edit2, Trash2, RefreshCw, Package, AlertTriangle,
  Search, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

const categories = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'food', label: 'Food' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'bedding', label: 'Bedding' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
]

const units = ['pieces', 'kg', 'liters', 'packs', 'boxes', 'bags', 'bottles', 'rolls', 'sets']

const emptyForm = {
  name: '',
  nameSo: '',
  category: 'cleaning',
  quantity: 0,
  unit: 'pieces',
  minQuantity: 5,
  costPerUnit: 0,
  supplier: '',
  notes: '',
}

interface InventoryItem {
  id: string
  name: string
  nameSo: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  costPerUnit: number
  supplier: string | null
  lastRestocked: string | null
  notes: string | null
}

function getStockStatus(item: InventoryItem) {
  if (item.quantity === 0) return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'Out of Stock' }
  if (item.quantity <= item.minQuantity) return { bg: 'rgba(234,179,8,0.15)', color: '#EAB308', label: 'Low Stock' }
  return { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: 'In Stock' }
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      const res = await adminFetch(`/api/admin/inventory?${params}`)
      if (res.ok) setItems(await res.json())
    } catch {
      toast.error('Failed to fetch inventory')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => { fetchItems() }, [fetchItems])

  const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length
  const outOfStockCount = items.filter(i => i.quantity === 0).length

  const filteredItems = search
    ? items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.nameSo.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : items

  function openCreate() {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(item: InventoryItem) {
    setEditingItem(item)
    setForm({
      name: item.name,
      nameSo: item.nameSo,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.nameSo || !form.quantity || !form.costPerUnit) {
      toast.error('Please fill in required fields')
      return
    }
    setSaving(true)
    try {
      if (editingItem) {
        const res = await adminFetch(`/api/admin/inventory/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        if (res.ok) {
          toast.success('Item updated')
          setDialogOpen(false)
          fetchItems()
        } else {
          toast.error('Failed to update item')
        }
      } else {
        const res = await adminFetch('/api/admin/inventory', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        if (res.ok) {
          toast.success('Item created')
          setDialogOpen(false)
          fetchItems()
        } else {
          toast.error('Failed to create item')
        }
      }
    } catch {
      toast.error('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this inventory item?')) return
    try {
      const res = await adminFetch(`/api/admin/inventory/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Item deleted')
        fetchItems()
      } else {
        toast.error('Failed to delete item')
      }
    } catch {
      toast.error('Failed to delete item')
    }
  }

  function getCategoryLabel(cat: string) {
    return categories.find(c => c.value === cat)?.label || cat
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Inventory</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>{items.length} total items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outOfStockCount > 0 && (
            <Card style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>{outOfStockCount} Out of Stock</p>
                  <p className="text-xs" style={{ color: '#A09890' }}>Items need immediate restocking</p>
                </div>
              </CardContent>
            </Card>
          )}
          {lowStockCount > 0 && (
            <Card style={{ backgroundColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)' }}>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#EAB308' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#EAB308' }}>{lowStockCount} Low Stock</p>
                  <p className="text-xs" style={{ color: '#A09890' }}>Items below minimum quantity</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <Card style={cardStyle}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A09890' }} />
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44" style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                <Filter className="w-4 h-4 mr-2" style={{ color: '#A09890' }} />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card style={cardStyle}>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" style={{ backgroundColor: '#08080A' }} />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#A09890' }}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No inventory items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E24' }}>
                    {['Name', 'Category', 'Quantity', 'Unit', 'Min Level', 'Cost/Unit', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#A09890' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item)
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid #1E1E24' }}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color: '#fff' }}>{item.name}</p>
                          <p className="text-xs" style={{ color: '#A09890' }}>{item.nameSo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-[10px] px-2 py-0.5" style={{ backgroundColor: 'rgba(196,160,60,0.12)', color: '#C4A03C' }}>
                            {getCategoryLabel(item.category)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#fff' }}>{item.quantity}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{item.unit}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{item.minQuantity}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#B8B0A4' }}>{item.costPerUnit.toFixed(2)} ETB</td>
                        <td className="px-4 py-3">
                          <Badge className="text-[10px] px-2 py-0.5" style={{ backgroundColor: status.bg, color: status.color }}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                              <Edit2 className="w-3.5 h-3.5" style={{ color: '#C4A03C' }} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription style={{ color: '#A09890' }}>
              {editingItem ? 'Update inventory item details' : 'Add a new item to inventory'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Name (EN) *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Name (SO) *</Label>
                <Input value={form.nameSo} onChange={(e) => setForm({ ...form, nameSo: e.target.value })}
                  required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>

            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Quantity *</Label>
                <Input type="number" min={0} value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Min Level</Label>
                <Input type="number" min={0} value={form.minQuantity}
                  onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Cost per Unit (ETB) *</Label>
                <Input type="number" min={0} step={0.01} value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
                  required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: '#B8B0A4' }}>Supplier</Label>
                <Input value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="Supplier name"
                  style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
              </div>
            </div>

            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Notes</Label>
              <Input value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
