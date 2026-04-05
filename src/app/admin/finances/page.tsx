'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  DollarSign, Plus, Edit, Trash2, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

const expenseCategories = ['supplies', 'salary', 'utilities', 'maintenance', 'food', 'other']
const revenueCategories = ['room', 'restaurant', 'other']

export default function FinancesPage() {
  const [summary, setSummary] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [revenues, setRevenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'revenue' | 'expense'>('revenue')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ description: '', amount: '', category: 'room', date: new Date().toISOString().split('T')[0] })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [summaryRes, expensesRes, revenueRes] = await Promise.all([
        adminFetch('/api/admin/finances/summary'),
        adminFetch('/api/admin/expenses'),
        adminFetch('/api/admin/revenue'),
      ])
      if (summaryRes.ok) setSummary(await summaryRes.json())
      if (expensesRes.ok) setExpenses(await expensesRes.json())
      if (revenueRes.ok) setRevenues(await revenueRes.json())
    } catch { toast.error('Failed to fetch finance data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate(type: 'revenue' | 'expense') {
    setDialogType(type)
    setEditId(null)
    setForm({ description: '', amount: '', category: type === 'revenue' ? 'room' : 'supplies', date: new Date().toISOString().split('T')[0] })
    setDialogOpen(true)
  }

  function openEdit(item: any, type: 'revenue' | 'expense') {
    setDialogType(type)
    setEditId(item.id)
    setForm({
      description: item.description,
      amount: String(item.amount),
      category: item.category,
      date: new Date(item.date).toISOString().split('T')[0],
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.description || !form.amount) { toast.error('Description and amount required'); return }
    const url = editId
      ? `/api/admin/${dialogType === 'revenue' ? 'revenue' : 'expenses'}/${editId}`
      : `/api/admin/${dialogType === 'revenue' ? 'revenue' : 'expenses'}`
    const method = editId ? 'PUT' : 'POST'
    try {
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      if (res.ok) { toast.success(editId ? 'Updated' : 'Added'); setDialogOpen(false); fetchData() }
    } catch { toast.error('Failed to save') }
  }

  async function deleteItem(id: string, type: 'revenue' | 'expense') {
    if (!confirm(`Delete this ${type} entry?`)) return
    try {
      const res = await adminFetch(`/api/admin/${type === 'revenue' ? 'revenue' : 'expenses'}/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchData() }
    } catch { toast.error('Failed to delete') }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Finances</h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>Track revenue and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} style={{ borderColor: '#1E1E24', color: '#A09890' }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={() => openCreate('revenue')} style={{ backgroundColor: '#22C55E', color: '#fff' }}>
            <Plus className="w-4 h-4 mr-2" /> Revenue
          </Button>
          <Button size="sm" onClick={() => openCreate('expense')} style={{ backgroundColor: '#EF4444', color: '#fff' }}>
            <Plus className="w-4 h-4 mr-2" /> Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" style={{ backgroundColor: '#111114' }} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Revenue', value: `${summary.totalRevenue.toLocaleString()} ETB`, color: '#22C55E', icon: TrendingUp },
            { title: 'Total Expenses', value: `${summary.totalExpenses.toLocaleString()} ETB`, color: '#EF4444', icon: TrendingDown },
            { title: 'Net Profit', value: `${summary.netProfit.toLocaleString()} ETB`, color: summary.netProfit >= 0 ? '#22C55E' : '#EF4444', icon: DollarSign },
            { title: 'This Month', value: `${summary.monthRevenue.toLocaleString()} ETB`, color: '#C4A03C', icon: ArrowUpRight },
          ].map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} style={cardStyle}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#A09890' }}>{card.title}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {/* Monthly Chart */}
      {summary?.monthlyBreakdown && summary.monthlyBreakdown.length > 0 && (
        <Card style={cardStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: '#fff' }}>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                  <XAxis dataKey="month" tick={{ fill: '#A09890', fontSize: 11 }} axisLine={{ stroke: '#1E1E24' }} />
                  <YAxis tick={{ fill: '#A09890', fontSize: 11 }} axisLine={{ stroke: '#1E1E24' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111114', border: '1px solid #1E1E24', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ color: '#A09890', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue & Expenses Tables */}
      <Tabs defaultValue="revenue">
        <TabsList style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }} className="border">
          <TabsTrigger value="revenue" className="data-[state=active]:text-green-400">
            💰 Revenue ({revenues.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:text-red-400">
            💸 Expenses ({expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card style={cardStyle}>
            <CardContent className="p-0">
              {revenues.length === 0 ? (
                <p className="text-center py-12" style={{ color: '#A09890' }}>No revenue entries yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1E1E24' }}>
                        {['Description', 'Category', 'Amount', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#A09890' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {revenues.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #1E1E24' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: '#fff' }}>{r.description}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs" style={{ borderColor: '#1E1E24', color: '#22C55E' }}>{r.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#22C55E' }}>{r.amount.toLocaleString()} ETB</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#A09890' }}>{formatDate(r.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r, 'revenue')}>
                                <Edit className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteItem(r.id, 'revenue')}>
                                <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card style={cardStyle}>
            <CardContent className="p-0">
              {expenses.length === 0 ? (
                <p className="text-center py-12" style={{ color: '#A09890' }}>No expense entries yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1E1E24' }}>
                        {['Description', 'Category', 'Amount', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#A09890' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #1E1E24' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: '#fff' }}>{e.description}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs" style={{ borderColor: '#1E1E24', color: '#EF4444' }}>{e.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#EF4444' }}>{e.amount.toLocaleString()} ETB</td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#A09890' }}>{formatDate(e.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(e, 'expense')}>
                                <Edit className="w-3.5 h-3.5" style={{ color: '#A09890' }} />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteItem(e.id, 'expense')}>
                                <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>{editId ? `Edit ${dialogType}` : `Add ${dialogType}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                  {(dialogType === 'revenue' ? revenueCategories : expenseCategories).map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Amount (ETB) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1"
                style={{ backgroundColor: dialogType === 'revenue' ? '#22C55E' : '#EF4444', color: '#fff' }}>
                {editId ? 'Update' : 'Add'} {dialogType}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
