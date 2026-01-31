'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Image as ImageIcon } from 'lucide-react'

export default function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string; mediaId: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)
  const [mediaId, setMediaId] = useState<string | null>(null)

  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')

  useEffect(() => {
    Promise.resolve(params).then(({ id, mediaId }) => {
      setMemorialId(id)
      setMediaId(mediaId)
      fetchMedia(mediaId)
    })
  }, [params])

  const fetchMedia = async (id: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setUrl(data.url || '')
    setCaption(data.caption || '')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaId) return

    setError(null)
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('media_items')
        .update({
          caption: caption || null,
        })
        .eq('id', mediaId)

      if (error) throw error

      router.push(`/memorials/${memorialId}?tab=gallery`)
    } catch (err: any) {
      setError(err.message || 'Failed to update photo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Edit Photo</h1>
          <p className="text-muted-foreground">Update photo details</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Preview */}
            {url && (
              <div className="w-full max-w-sm mx-auto">
                <div
                  className="aspect-square rounded-lg bg-cover bg-center border-2 border-border"
                  style={{ backgroundImage: `url(${url})` }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Describe this memory..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="bg-background border-border text-foreground"
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
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
