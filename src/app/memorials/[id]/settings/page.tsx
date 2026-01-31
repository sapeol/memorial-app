'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { ImageUpload } from '@/components/image-upload'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Shield, Trash2, Save, AlertTriangle } from 'lucide-react'

const THEME_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Navy', value: '#1e1b4b' },
  { name: 'Sage', value: '#14532d' },
  { name: 'Earth', value: '#451a03' },
  { name: 'Stone', value: '#292524' },
]

export default function MemorialSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Memorial state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [passingDate, setPassingDate] = useState<Date | undefined>()
  const [bio, setBio] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [themeColor, setThemeColor] = useState('#1e293b')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
        return
      }
      setUserId(user.id)

      const { id } = await params
      setMemorialId(id)

      // Fetch memorial
      const { data: memorial, error } = await supabase
        .from('memorials')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !memorial) {
        router.push('/dashboard')
        return
      }

      setIsOwner(memorial.owner_id === user.id)
      if (memorial.owner_id !== user.id) {
        router.push(`/memorials/${id}`)
        return
      }

      setName(memorial.name || '')
      setBirthDate(memorial.birth_date ? new Date(memorial.birth_date) : undefined)
      setPassingDate(memorial.passing_date ? new Date(memorial.passing_date) : undefined)
      setBio(memorial.bio || '')
      setCoverImage(memorial.cover_image || '')
      setThemeColor(memorial.theme_color || '#1e293b')
      setLoading(false)
    }

    loadData()
  }, [params, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId) return

    setError(null)
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memorials')
        .update({
          name,
          birth_date: birthDate?.toISOString() || null,
          passing_date: passingDate?.toISOString() || null,
          bio,
          cover_image: coverImage || null,
          theme_color: themeColor,
        })
        .eq('id', memorialId)

      if (error) throw error
      router.push(`/memorials/${memorialId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!memorialId) return

    if (!confirm('Are you absolutely sure? This will permanently delete this memorial and all its content. This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      // Delete all related data first (cascade delete)
      await supabase.from('rituals').delete().eq('memorial_id', memorialId)
      await supabase.from('guestbook_entries').delete().eq('memorial_id', memorialId)
      await supabase.from('media_items').delete().eq('memorial_id', memorialId)
      await supabase.from('milestones').delete().eq('memorial_id', memorialId)
      await supabase.from('memorial_participants').delete().eq('memorial_id', memorialId)
      await supabase.from('invitations').delete().eq('memorial_id', memorialId)
      // Finally delete the memorial
      await supabase.from('memorials').delete().eq('id', memorialId)

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete memorial')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md p-10 bg-card border border-border text-center rounded-3xl shadow-sm">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-foreground mb-3">Access Denied</h1>
          <p className="text-muted-foreground font-medium mb-8">Only the memorial owner can access these settings.</p>
          <Button onClick={() => router.back()} className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Memorial
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Memorial Settings</h1>
          <p className="text-lg text-muted-foreground font-medium">Manage preferences for this memorial.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-8">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {/* General Settings */}
        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm mb-10">
          <form onSubmit={handleSave} className="space-y-8">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">General Information</h2>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground h-12 rounded-xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Birth Date</Label>
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="Select birth date"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Passing Date</Label>
                <DatePicker
                  value={passingDate}
                  onChange={setPassingDate}
                  placeholder="Select passing date"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cover Image</Label>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                onRemove={() => setCoverImage('')}
                uploadPath="covers"
                userId={userId || ''}
                maxSize={5}
              />
              <div className="mt-4">
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Memorial Theme Tone</Label>
              <div className="flex flex-wrap gap-4 p-2">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setThemeColor(color.value)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      themeColor === color.value
                        ? 'border-primary scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Write a brief biography or obituary..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                className="bg-background border-border text-foreground rounded-2xl p-4 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-14 text-lg font-medium shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 bg-destructive/5 border border-destructive/20 rounded-3xl">
          <h2 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            Deleting a memorial is permanent. All photos, milestones, and memories will be lost forever.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="rounded-full px-8 h-12 font-semibold"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Memorial Permanentely
              </>
            )}
          </Button>

          {showDeleteConfirm && (
            <div className="mt-8 p-6 rounded-2xl bg-destructive/10 border border-destructive/30 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-sm text-destructive mb-6 font-bold leading-relaxed">
                Are you absolutely sure? This action cannot be undone. All data associated with this memorial will be permanently erased.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-border rounded-full flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground rounded-full flex-1 h-12"
                >
                  Yes, Delete Memorial
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}