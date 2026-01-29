'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import { ImageUpload } from '@/components/image-upload'
import type { Database } from '@/types/database'

const THEME_COLORS = [
  { name: 'Slate', value: '#0f172a' },
  { name: 'Rose', value: '#881337' },
  { name: 'Amber', value: '#b45309' },
  { name: 'Emerald', value: '#047857' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Violet', value: '#6d28d9' },
]

export default function NewMemorialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [passingDate, setPassingDate] = useState('')
  const [bio, setBio] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [themeColor, setThemeColor] = useState('#0f172a')

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
          birth_date: birthDate || null,
          passing_date: passingDate || null,
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
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2"
          >
            ← Back
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Create a Memorial</h1>
          <p className="text-muted-foreground">Honor and remember your loved one with a lasting tribute</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingDate">Passing Date</Label>
                <Input
                  id="passingDate"
                  type="date"
                  value={passingDate}
                  onChange={(e) => setPassingDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            {/* Cover Image */}
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

            {/* Theme Color */}
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

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Write a brief biography or obituary..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-border text-foreground hover:bg-muted flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand text-brand-foreground hover:bg-brand-hover flex-1"
              >
                {loading ? 'Creating...' : 'Create Memorial'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
