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
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Create a Ritual</h1>
          <p className="text-lg text-muted-foreground font-medium">Set up a personal remembrance ritual to honor their life.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ritual Type</Label>
              <div className="grid grid-cols-2 gap-4">
                {RITUAL_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setRitualType(type.value)}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        ritualType === type.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/20 hover:bg-secondary/20'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${ritualType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-bold uppercase tracking-wider ${ritualType === type.value ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="guestName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Name</Label>
              <Input
                id="guestName"
                type="text"
                placeholder="How you wish to be remembered"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-background border-border text-foreground h-12 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">A Note of Love</Label>
              <Textarea
                id="message"
                placeholder="What does this ritual mean to you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                variant="outline" className="cursor-pointer"
                onClick={() => router.back()}
                className="border-border rounded-full flex-1 h-14 text-lg font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit" className="cursor-pointer"
                disabled={loading}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-1 h-14 text-lg font-medium shadow-sm"
              >
                {loading ? 'Creating...' : 'Create Ritual'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}