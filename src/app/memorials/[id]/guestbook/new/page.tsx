'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react'

/**
 * Page for leaving a heartfelt message in the memorial guestbook.
 */
export default function NewGuestbookEntryPage() {
  const router = useRouter()
  const params = useParams()
  const memorialId = params.id as string
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [message, setMessage] = useState('')
  const [authorName, setAuthorName] = useState(user?.user_metadata?.full_name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId || !user) return

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('guestbook_entries')
        .insert({
          memorial_id: memorialId,
          message,
          author_name: authorName || user.email || 'Anonymous',
          author_id: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=guestbook`)
    } catch (err: any) {
      setError(err.message || 'Failed to add message')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="mb-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Leave a Message</h1>
          <p className="text-lg text-muted-foreground font-medium">Share your condolences and cherished memories.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-[32px] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="authorName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Name</Label>
              <Input
                id="authorName"
                type="text"
                placeholder="How should your name appear?"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-background border-border text-foreground h-14 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message *</Label>
              <Textarea
                id="message"
                placeholder="Share your memories, express condolences, or leave a kind word..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={8}
                className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed font-medium text-lg"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 shake">
                <p className="text-destructive text-sm font-bold">{error}</p>
              </div>
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
                disabled={loading || !message}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </span>
                ) : 'Post to Guestbook'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}