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
  { name: 'Slate', value: '#0f172a' },
  { name: 'Rose', value: '#881337' },
  { name: 'Amber', value: '#b45309' },
  { name: 'Emerald', value: '#047857' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Violet', value: '#6d28d9' },
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
  const [themeColor, setThemeColor] = useState('#0f172a')
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
      setThemeColor(memorial.theme_color || '#0f172a')
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
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-background flex items-center justify-center p-6">
        <Card className="max-w-md p-8 bg-card/50 backdrop-blur border-border text-center">
          <Shield className="w-12 h-12 text-brand mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Only the memorial owner can access settings.</p>
          <Button onClick={() => router.back()} className="bg-brand text-brand-foreground hover:bg-brand-hover">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Memorial
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Memorial Settings</h1>
          <p className="text-muted-foreground">Manage your memorial settings and preferences</p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* General Settings */}
        <Card className="p-8 bg-card/50 backdrop-blur border-border mb-6">
          <form onSubmit={handleSave} className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">General Information</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Birth Date</Label>
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="Select birth date"
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Date</Label>
                <DatePicker
                  value={passingDate}
                  onChange={setPassingDate}
                  placeholder="Select passing date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                onRemove={() => setCoverImage('')}
                uploadPath="covers"
                userId={userId || ''}
                maxSize={5}
              />
              <div className="flex items-center gap-2">
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Theme Color</Label>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setThemeColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      themeColor === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Write a brief biography or obituary..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 bg-destructive/5 border-destructive/20">
          <h2 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete a memorial, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Memorial
              </>
            )}
          </Button>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive mb-4">
                This will permanently delete this memorial, all photos, milestones, guestbook entries, and rituals. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Yes, Delete Memorial
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
