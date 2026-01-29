'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Flame, Heart, Flower2, Star } from 'lucide-react'

const RITUAL_TYPES = [
  { value: 'candle', label: 'Light a Candle', icon: Flame },
  { value: 'flower', label: 'Leave Flowers', icon: Flower2 },
  { value: 'heart', label: 'Send Love', icon: Heart },
  { value: 'custom', label: 'Custom Ritual', icon: Star },
] as const

export default function NewRitualPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState('')
  const [ritualType, setRitualType] = useState<'candle' | 'flower' | 'heart' | 'custom'>('candle')

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
        .from('rituals')
        .insert({
          memorial_id: memorialId,
          message,
          guest_name: guestName || user.user_metadata?.name || user.email || 'Anonymous',
          ritual_type: ritualType,
          user_id: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=rituals`)
    } catch (err: any) {
      setError(err.message || 'Failed to create ritual')
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Create a Ritual</h1>
          <p className="text-muted-foreground">Set up a personal remembrance ritual</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Ritual Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {RITUAL_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setRitualType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        ritualType === type.value
                          ? 'border-brand bg-brand/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestName">Your Name</Label>
              <Input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="What does this ritual mean to you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                {loading ? 'Creating...' : 'Create Ritual'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
