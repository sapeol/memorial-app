'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { ImageUpload } from '@/components/image-upload'

const THEME_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Navy', value: '#1e1b4b' },
  { name: 'Sage', value: '#14532d' },
  { name: 'Earth', value: '#451a03' },
  { name: 'Stone', value: '#292524' },
]

export default function NewMemorialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [passingDate, setPassingDate] = useState<Date | undefined>()
  const [bio, setBio] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [themeColor, setThemeColor] = useState('#1e293b')

  // Get current user on mount
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      // Create memorial
      const { data: memorial, error: memorialError } = await supabase
        .from('memorials')
        .insert({
          name,
          birth_date: birthDate?.toISOString() || null,
          passing_date: passingDate?.toISOString() || null,
          bio,
          cover_image: coverImage || null,
          theme_color: themeColor,
          owner_id: user.id,
        })
        .select()
        .single()

      if (memorialError) throw memorialError

      // Add owner as a participant
      await supabase.from('memorial_participants').insert({
        memorial_id: memorial.id,
        user_id: user.id,
        access_level: 'owner',
        invited_by: user.id,
        accepted_at: new Date().toISOString(),
      })

      router.push(`/memorials/${memorial.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create memorial')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Create a Memorial</h1>
          <p className="text-lg text-muted-foreground font-medium">Honor and remember your loved one with a lasting tribute.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
              />
            </div>

            {/* Dates */}
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

            {/* Cover Image */}
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

            {/* Theme Color */}
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

            {/* Bio */}
            <div className="space-y-3">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Brief Life Story</Label>
              <Textarea
                id="bio"
                placeholder="Write a brief biography or obituary..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-2xl p-4 leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-border rounded-full flex-1 h-14 text-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-1 h-14 text-lg font-medium shadow-sm"
              >
                {loading ? 'Preserving...' : 'Create Memorial'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}