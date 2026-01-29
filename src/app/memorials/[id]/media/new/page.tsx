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
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Add Photo</h1>
          <p className="text-muted-foreground">Share a memory in the gallery</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Photo *</Label>
              <ImageUpload
                value={mediaUrl}
                onChange={setMediaUrl}
                onRemove={() => setMediaUrl('')}
                uploadPath={`memorial-${memorialId || 'temp'}`}
                userId={userId || ''}
                maxSize={5}
              />
              <div className="flex items-center gap-2">
                <Input
                  id="mediaUrl"
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">Upload a photo or paste a direct image URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Describe this memory..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
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
                {loading ? 'Adding...' : 'Add Photo'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
