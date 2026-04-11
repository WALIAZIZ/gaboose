'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Save, Globe, CheckCircle2, Loader2, ChevronDown, ChevronUp, Languages } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { adminFetch } from '@/lib/admin-fetch'
import { translations, translationSections } from '@/lib/language'

const cardStyle = { backgroundColor: '#111114', borderColor: '#1E1E24' }

// Get all translation keys
const allTranslationKeys = Object.keys(translations.en)

// Group keys by section
function getSectionForKey(key: string): string {
  for (const section of translationSections) {
    if (key.startsWith(section.id + '.')) return section.id
  }
  return 'other'
}

function groupKeysBySection(keys: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const section of translationSections) {
    const sectionKeys = keys.filter(k => k.startsWith(section.id + '.'))
    if (sectionKeys.length > 0) groups[section.id] = sectionKeys
  }
  // Any leftover keys
  const grouped = new Set(keys)
  for (const g of Object.values(groups)) {
    for (const k of g) grouped.delete(k)
  }
  if (grouped.size > 0) groups['other'] = Array.from(grouped)
  return groups
}

export default function TranslationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [savingAll, setSavingAll] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(translationSections.map(s => s.id)))

  // Load existing overrides from database
  const loadOverrides = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/content?prefix=lang')
      if (res.ok) {
        const data = await res.json()
        const loaded: Record<string, string> = {}
        for (const item of data) {
          if (item.key.startsWith('lang.so.') && (item.valueSo || item.value)) {
            const transKey = item.key.slice('lang.so.'.length)
            loaded[transKey] = item.valueSo || item.value
          }
        }
        setOverrides(loaded)
      }
    } catch {
      toast.error('Failed to load translations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOverrides() }, [loadOverrides])

  // Filter keys based on search
  const filteredKeys = searchQuery
    ? allTranslationKeys.filter(k =>
        k.toLowerCase().includes(searchQuery.toLowerCase()) ||
        translations.en[k].toLowerCase().includes(searchQuery.toLowerCase()) ||
        translations.so[k].toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTranslationKeys

  const groupedKeys = groupKeysBySection(filteredKeys)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const updateOverride = (key: string, value: string) => {
    setOverrides(prev => ({ ...prev, [key]: value }))
  }

  const isCustomized = (key: string) => {
    return overrides[key] !== undefined && overrides[key] !== translations.so[key]
  }

  const saveSection = async (sectionId: string) => {
    const sectionKeys = groupedKeys[sectionId]
    if (!sectionKeys) return

    setSaving(prev => ({ ...prev, [sectionId]: true }))
    try {
      for (const key of sectionKeys) {
        const soValue = overrides[key] !== undefined ? overrides[key] : translations.so[key]
        const dbKey = `lang.so.${key}`
        await adminFetch('/api/admin/content', {
          method: 'PUT',
          body: JSON.stringify({
            key: dbKey,
            value: translations.en[key],
            valueSo: soValue,
          }),
        })
      }
      toast.success(`Saved ${translationSections.find(s => s.id === sectionId)?.label || sectionId} translations`)
    } catch {
      toast.error('Failed to save translations')
    } finally {
      setSaving(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const saveAll = async () => {
    setSavingAll(true)
    try {
      for (const key of allTranslationKeys) {
        const soValue = overrides[key] !== undefined ? overrides[key] : translations.so[key]
        const dbKey = `lang.so.${key}`
        await adminFetch('/api/admin/content', {
          method: 'PUT',
          body: JSON.stringify({
            key: dbKey,
            value: translations.en[key],
            valueSo: soValue,
          }),
        })
      }
      toast.success('All translations saved successfully')
    } catch {
      toast.error('Failed to save all translations')
    } finally {
      setSavingAll(false)
    }
  }

  const getSectionLabel = (id: string) => {
    return translationSections.find(s => s.id === id)?.label || id
  }

  const getCustomizedCount = (keys: string[]) => {
    return keys.filter(k => isCustomized(k)).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" style={{ backgroundColor: '#08080A' }} />
        <Skeleton className="h-12 w-full" style={{ backgroundColor: '#08080A' }} />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" style={{ backgroundColor: '#08080A' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#fff' }}>
            <Languages className="w-6 h-6" style={{ color: '#C4A03C' }} />
            Somali Translation Editor
          </h1>
          <p className="text-sm mt-1" style={{ color: '#A09890' }}>
            Edit and customize Somali translations. English is shown as reference.
          </p>
        </div>
        <Button
          onClick={saveAll}
          disabled={savingAll}
          className="shrink-0"
          style={{ backgroundColor: '#C4A03C', color: '#000' }}
        >
          {savingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving All...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Translations
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A09890' }} />
        <Input
          placeholder="Search translations (key, English, or Somali text)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          style={{ backgroundColor: '#08080A', borderColor: '#1E1E24', color: '#fff' }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge style={{ backgroundColor: 'rgba(196,160,60,0.15)', color: '#C4A03C', border: '1px solid rgba(196,160,60,0.3)' }}>
          {allTranslationKeys.length} total keys
        </Badge>
        <Badge style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
          {Object.keys(overrides).filter(k => isCustomized(k)).length} customized
        </Badge>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#A09890' }}>
          <CheckCircle2 className="w-3 h-3" style={{ color: '#22C55E' }} />
          <span>Green badge = customized from default</span>
        </div>
      </div>

      {/* Translation Sections */}
      <div className="space-y-4">
        {Object.entries(groupedKeys).map(([sectionId, keys]) => (
          <Card key={sectionId} style={cardStyle}>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(196,160,60,0.15)' }}>
                    <Globe className="w-4 h-4" style={{ color: '#C4A03C' }} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold" style={{ color: '#fff' }}>
                      {getSectionLabel(sectionId)}
                    </CardTitle>
                    <p className="text-xs" style={{ color: '#A09890' }}>
                      {keys.length} keys
                      {getCustomizedCount(keys) > 0 && (
                        <span className="ml-2" style={{ color: '#22C55E' }}>
                          • {getCustomizedCount(keys)} customized
                        </span>
                      )}
                    </p>
                  </div>
                  {expandedSections.has(sectionId) ? (
                    <ChevronUp className="w-4 h-4 ml-auto" style={{ color: '#A09890' }} />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto" style={{ color: '#A09890' }} />
                  )}
                </button>
                {expandedSections.has(sectionId) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveSection(sectionId)}
                    disabled={saving[sectionId]}
                    className="ml-2 shrink-0"
                    style={{ borderColor: '#1E1E24', color: '#C4A03C' }}
                  >
                    {saving[sectionId] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save
                  </Button>
                )}
              </div>
            </CardHeader>

            {expandedSections.has(sectionId) && (
              <CardContent className="pt-4 space-y-3">
                {keys.map(key => (
                  <div
                    key={key}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: '#08080A',
                      border: isCustomized(key) ? '1px solid rgba(34,197,94,0.3)' : '1px solid #1E1E24',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono" style={{ color: '#A09890' }}>{key}</span>
                      {isCustomized(key) && (
                        <Badge className="text-xs px-1.5 py-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                          Customized
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* English (read-only) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium" style={{ color: '#A09890' }}>
                          English (reference)
                        </Label>
                        <div
                          className="p-2 rounded text-sm"
                          style={{ backgroundColor: '#111114', border: '1px solid #1E1E24', color: '#E8E0D8' }}
                        >
                          {translations.en[key]}
                        </div>
                      </div>

                      {/* Somali (editable) */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium" style={{ color: '#C4A03C' }}>
                          Somali (editable)
                        </Label>
                        <Textarea
                          value={overrides[key] !== undefined ? overrides[key] : translations.so[key]}
                          onChange={(e) => updateOverride(key, e.target.value)}
                          rows={2}
                          className="text-sm resize-none"
                          style={{
                            backgroundColor: '#111114',
                            borderColor: isCustomized(key) ? 'rgba(34,197,94,0.4)' : '#1E1E24',
                            color: '#fff',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
