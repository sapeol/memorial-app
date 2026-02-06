'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/image-upload'
import { useAuthStore } from '@/lib/store/auth-store'
import { ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react'

/**
 * Page for adding new media items (photos) to a memorial.
 * Animated with Framer Motion for a fluid experience.
 */
export default function NewMediaPage() {
  const router = useRouter()
  const params = useParams()
  const memorialId = params.id as string
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId || !user) return

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('media_items')
        .insert({
          memorial_id: memorialId,
          url: mediaUrl,
          caption,
          media_type: 'photo',
          uploaded_by: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=gallery`)
    } catch (err: any) {
      setError(err.message || 'Failed to add photo')
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Add Photo</h1>
          <p className="text-lg text-muted-foreground font-medium">Share a cherished memory in the gallery.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-[32px] shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Caption field is now top-most on mobile/all for immediate sharing text entry */}
            <div className="space-y-3">
              <Label htmlFor="caption" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Describe this memory..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed font-medium focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <Label htmlFor="mediaUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">The Photo *</Label>
              <ImageUpload
                value={mediaUrl}
                onChange={setMediaUrl}
                onRemove={() => setMediaUrl('')}
                uploadPath={`memorial-${memorialId}`}
                userId={user?.id || ''}
                maxSize={5}
              />
              <div className="mt-4">
                <Input
                  id="mediaUrl"
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="bg-background border-border text-foreground h-12 rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 shake"
              >
                <p className="text-destructive text-sm font-bold">{error}</p>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-border rounded-full flex-1 h-14 text-lg font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !mediaUrl}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </span>
                ) : 'Add to Gallery'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </motion.div>
  )
}
