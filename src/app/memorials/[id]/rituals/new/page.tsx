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
import { useAuthStore } from '@/lib/store/auth-store'
import { Flame, Heart, Flower2, Star, ArrowLeft, Loader2 } from 'lucide-react'

const RITUAL_TYPES = [
  { value: 'candle', label: 'Light a Candle', icon: Flame },
  { value: 'flower', label: 'Leave Flowers', icon: Flower2 },
  { value: 'heart', label: 'Send Love', icon: Heart },
  { value: 'custom', label: 'Custom Ritual', icon: Star },
] as const

/**
 * Page for creating a symbolic ritual to honor the deceased.
 * Redesigned to prioritize the personal note and add smooth animations.
 */
export default function NewRitualPage() {
  const router = useRouter()
  const params = useParams()
  const memorialId = params.id as string
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [message, setMessage] = useState('')
  const [guestName, setGuestName] = useState(user?.user_metadata?.full_name || '')
  const [ritualType, setRitualType] = useState<typeof RITUAL_TYPES[number]['value']>('candle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId || !user) return

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('rituals')
        .insert({
          memorial_id: memorialId,
          message,
          guest_name: guestName || user.email || 'Anonymous',
          ritual_type: ritualType,
          user_id: user.id,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=rituals`)
    } catch (err: any) {
      setError(err.message || 'Failed to create ritual')
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
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
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Perform a Ritual</h1>
          <p className="text-lg text-muted-foreground font-medium">Set up a personal remembrance ritual to honor their life.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-[32px] shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Personal Message is now top-most on all devices */}
            <div className="space-y-3">
              <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">A Note of Love *</Label>
              <Textarea
                id="message"
                placeholder="What does this ritual mean to you? Share a short prayer or thought."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed font-medium focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {/* Ritual Selection */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">The Symbolic Act</Label>
              <div className="grid grid-cols-2 gap-4">
                {RITUAL_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = ritualType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setRitualType(type.value)}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm scale-[1.02]'
                          : 'border-border hover:border-primary/20 hover:bg-secondary/20'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</span>
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
                className="bg-background border-border text-foreground h-14 rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                disabled={loading || !message}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </span>
                ) : 'Complete Ritual'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </motion.div>
  )
}