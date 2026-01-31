'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/image-upload'

export default function NewMediaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo')

  useEffect(() => {
    // Get memorial ID from params
    Promise.resolve(params).then(({ id }) => setMemorialId(id))
    // Get current user
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId) return

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      const { error: insertError } = await supabase
        .from('media_items')
        .insert({
          memorial_id: memorialId,
          url: mediaUrl,
          caption,
          media_type: mediaType,
          uploaded_by: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=gallery`)
    } catch (err: any) {
      setError(err.message || 'Failed to add photo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Add Photo</h1>
          <p className="text-lg text-muted-foreground font-medium">Share a cherished memory in the gallery.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="mediaUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">The Photo *</Label>
              <ImageUpload
                value={mediaUrl}
                onChange={setMediaUrl}
                onRemove={() => setMediaUrl('')}
                uploadPath={`memorial-${memorialId || 'temp'}`}
                userId={userId || ''}
                maxSize={5}
              />
              <div className="mt-4">
                <Input
                  id="mediaUrl"
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="caption" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Describe this memory..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
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
                {loading ? 'Adding...' : 'Add Photo'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
