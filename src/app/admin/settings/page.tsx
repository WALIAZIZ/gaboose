'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Shield, UserCog, Plus, Trash2, RefreshCw, Key, UserPlus, Users,
  CreditCard, Building2, Globe, Save, Loader2, Phone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

interface AdminUser {
  id: string
  username: string
  name: string
  role: string
  createdAt: string
}

interface PaymentForm {
  bank1_name: string
  bank1_account: string
  bank1_holder: string
  bank2_name: string
  bank2_account: string
  bank2_holder: string
  bank3_name: string
  bank3_account: string
  bank3_holder: string
  instructions: string
  instructionsSo: string
}

const defaultPaymentForm: PaymentForm = {
  bank1_name: 'Telebirr',
  bank1_account: '0915210607',
  bank1_holder: 'Gaboose Hotel',
  bank2_name: 'ebirr',
  bank2_account: '0915210607',
  bank2_holder: 'Gaboose Hotel',
  bank3_name: 'Kaafi',
  bank3_account: '0915210607',
  bank3_holder: 'Gaboose Hotel',
  instructions: 'Send the full amount to any of the accounts below, then upload a screenshot of your payment receipt. Your booking will be confirmed once payment is verified.',
  instructionsSo: 'Dhig lacagta oo dhamaystiran si kastaba ha ahaatee accountka hoose, kadibna soo geli sawirka waraaqaha lacag bixinta. Dalabkaaga waa la xaqiiji doonaa marka lacag bixinta la verify gareeyo.',
}

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'employee' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(defaultPaymentForm)
  const [savingPayment, setSavingPayment] = useState(false)
  const [paymentLoaded, setPaymentLoaded] = useState(false)

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/settings')
      if (res.ok) setAdmins(await res.json())
      else if (res.status === 403) setAdmins([])
    } catch { /* ignore - employee might not have access */ }
    finally { setLoading(false) }
  }, [])

  const fetchPaymentSettings = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/content?prefix=payment')
      if (res.ok) {
        const data = await res.json()
        const form: PaymentForm = { ...defaultPaymentForm }
        for (const item of data) {
          switch (item.key) {
            case 'payment.bank1_name': form.bank1_name = item.value; break
            case 'payment.bank1_account': form.bank1_account = item.value; break
            case 'payment.bank1_holder': form.bank1_holder = item.value; break
            case 'payment.bank2_name': form.bank2_name = item.value; break
            case 'payment.bank2_account': form.bank2_account = item.value; break
            case 'payment.bank2_holder': form.bank2_holder = item.value; break
            case 'payment.bank3_name': form.bank3_name = item.value; break
            case 'payment.bank3_account': form.bank3_account = item.value; break
            case 'payment.bank3_holder': form.bank3_holder = item.value; break
            case 'payment.instructions': form.instructions = item.value; break
            case 'payment.instructionsSo': form.instructionsSo = item.valueSo || item.value; break
          }
        }
        setPaymentForm(form)
      }
    } catch { /* use defaults */ }
    finally { setPaymentLoaded(true) }
  }, [])

  useEffect(() => { fetchAdmins(); fetchPaymentSettings() }, [fetchAdmins, fetchPaymentSettings])

  async function savePaymentSettings() {
    setSavingPayment(true)
    try {
      const keys = [
        { key: 'payment.bank1_name', value: paymentForm.bank1_name, valueSo: paymentForm.bank1_name },
        { key: 'payment.bank1_account', value: paymentForm.bank1_account, valueSo: paymentForm.bank1_account },
        { key: 'payment.bank1_holder', value: paymentForm.bank1_holder, valueSo: paymentForm.bank1_holder },
        { key: 'payment.bank2_name', value: paymentForm.bank2_name, valueSo: paymentForm.bank2_name },
        { key: 'payment.bank2_account', value: paymentForm.bank2_account, valueSo: paymentForm.bank2_account },
        { key: 'payment.bank2_holder', value: paymentForm.bank2_holder, valueSo: paymentForm.bank2_holder },
        { key: 'payment.bank3_name', value: paymentForm.bank3_name, valueSo: paymentForm.bank3_name },
        { key: 'payment.bank3_account', value: paymentForm.bank3_account, valueSo: paymentForm.bank3_account },
        { key: 'payment.bank3_holder', value: paymentForm.bank3_holder, valueSo: paymentForm.bank3_holder },
        { key: 'payment.instructions', value: paymentForm.instructions, valueSo: paymentForm.instructionsSo },
      ]

      for (const item of keys) {
        await adminFetch('/api/admin/content', {
          method: 'PUT',
          body: JSON.stringify(item),
        })
      }

      toast.success('Payment settings saved')
    } catch {
      toast.error('Failed to save payment settings')
    } finally {
      setSavingPayment(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ action: 'changePassword', currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      })
      if (res.ok) {
        toast.success('Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to change password')
      }
    } catch { toast.error('Failed to change password') }
    finally { setChangingPassword(false) }
  }

  async function createAdminUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast.error('All fields are required')
      return
    }
    setCreatingUser(true)
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(newUser),
      })
      if (res.ok) {
        toast.success('User created successfully')
        setShowAddUser(false)
        setNewUser({ username: '', password: '', name: '', role: 'employee' })
        fetchAdmins()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create user')
      }
    } catch { toast.error('Failed to create user') }
    finally { setCreatingUser(false) }
  }

  async function deleteAdmin(id: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.success('User deleted'); fetchAdmins() }
      else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete user')
      }
    } catch { toast.error('Failed to delete user') }
  }

  async function updateRole(id: string, role: string) {
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ action: 'updateUser', userId: id, role }),
      })
      if (res.ok) { toast.success('Role updated'); fetchAdmins() }
    } catch { toast.error('Failed to update role') }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#fff' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#A09890' }}>Manage your account, admin users, and payment settings</p>
      </div>

      {/* Payment Accounts */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
            <CreditCard className="w-4 h-4" style={{ color: '#C4A03C' }} /> Payment Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!paymentLoaded ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" style={{ backgroundColor: '#08080A' }} />)}
            </div>
          ) : (
            <>
              {/* Bank 1 - Telebirr */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                    <Globe className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>Mobile Money 1 (Telebirr)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-10">
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Service Name</Label>
                    <Input value={paymentForm.bank1_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank1_name: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Number</Label>
                    <Input value={paymentForm.bank1_account}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank1_account: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Holder</Label>
                    <Input value={paymentForm.bank1_holder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank1_holder: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Bank 2 - ebirr */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(168,85,247,0.15)' }}>
                    <CreditCard className="w-4 h-4" style={{ color: '#A855F7' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>Mobile Money 2 (ebirr)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-10">
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Service Name</Label>
                    <Input value={paymentForm.bank2_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank2_name: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Number</Label>
                    <Input value={paymentForm.bank2_account}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank2_account: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Holder</Label>
                    <Input value={paymentForm.bank2_holder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank2_holder: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Bank 3 - Kaafi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                    <Phone className="w-4 h-4" style={{ color: '#22C55E' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>Mobile Money 3 (Kaafi)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-10">
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Service Name</Label>
                    <Input value={paymentForm.bank3_name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank3_name: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Number</Label>
                    <Input value={paymentForm.bank3_account}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank3_account: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Account Holder</Label>
                    <Input value={paymentForm.bank3_holder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank3_holder: e.target.value })}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: '#fff' }}>Payment Instructions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>English</Label>
                    <Textarea value={paymentForm.instructions}
                      onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                      rows={3}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: '#A09890' }}>Somali</Label>
                    <Textarea value={paymentForm.instructionsSo}
                      onChange={(e) => setPaymentForm({ ...paymentForm, instructionsSo: e.target.value })}
                      rows={3}
                      style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
                  </div>
                </div>
              </div>

              <Button onClick={savePaymentSettings} disabled={savingPayment} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {savingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {savingPayment ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator style={{ backgroundColor: '#1E1E24' }} />

      {/* Change Password */}
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
            <Key className="w-4 h-4" style={{ color: '#C4A03C' }} /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Current Password</Label>
              <Input type="password" value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>New Password</Label>
              <Input type="password" value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required minLength={6}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required minLength={6}
                style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <Button type="submit" disabled={changingPassword} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator style={{ backgroundColor: '#1E1E24' }} />

      {/* Admin Users */}
      <Card style={cardStyle}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#fff' }}>
              <Users className="w-4 h-4" style={{ color: '#C4A03C' }} /> Admin Users
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddUser(true)} style={{ backgroundColor: '#C4A03C', color: '#000' }}>
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" style={{ backgroundColor: '#08080A' }} />)}
            </div>
          ) : admins.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#A09890' }}>No admin users found or you don&apos;t have permission.</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: '#08080A', border: '1px solid #1E1E24' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: admin.role === 'admin' ? 'rgba(196, 160, 60, 0.15)' : 'rgba(59,130,246,0.15)' }}>
                      {admin.role === 'admin' ? (
                        <Shield className="w-5 h-5" style={{ color: '#C4A03C' }} />
                      ) : (
                        <UserCog className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#fff' }}>{admin.name}</p>
                      <p className="text-xs" style={{ color: '#A09890' }}>@{admin.username} · Created {formatDate(admin.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={admin.role} onValueChange={(v) => updateRole(admin.id, v)}>
                      <SelectTrigger className="w-28 h-8 text-xs" style={{ backgroundColor: '#111114', borderColor: '#1E1E24', color: '#fff' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteAdmin(admin.id)}>
                      <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#fff' }}>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={createAdminUser} className="space-y-4">
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Full Name *</Label>
              <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Username *</Label>
              <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Password *</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required minLength={6} style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }} />
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#B8B0A4' }}>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#111114', borderColor: '#1E1E24' }}>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                  <SelectItem value="employee">Employee (limited)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={creatingUser} className="flex-1" style={{ backgroundColor: '#C4A03C', color: '#000' }}>
                {creatingUser ? 'Creating...' : 'Create User'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddUser(false)} style={{ borderColor: '#1E1E24', color: '#A09890' }}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
