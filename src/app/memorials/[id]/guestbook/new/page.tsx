'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export default function NewGuestbookEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [authorName, setAuthorName] = useState('')

  useState(() => {
    Promise.resolve(params).then(({ id }) => setMemorialId(id))
  })

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
        .from('guestbook_entries')
        .insert({
          memorial_id: memorialId,
          message,
          author_name: authorName || user.user_metadata?.name || user.email || 'Anonymous',
          author_id: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=guestbook`)
    } catch (err: any) {
      setError(err.message || 'Failed to add message')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Leave a Message</h1>
          <p className="text-muted-foreground">Share your condolences and memories</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="authorName">Your Name</Label>
              <Input
                id="authorName"
                type="text"
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Share your memories, express condolences, or leave a kind word..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
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
                className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1"
              >
                {loading ? 'Posting...' : 'Post Message'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
