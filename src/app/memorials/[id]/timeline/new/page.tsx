'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { ArrowLeft, Loader2, MapPin, Milestone } from 'lucide-react'

/**
 * Page for adding significant milestones to a memorial timeline.
 * Features access control based on user relationship to the memorial.
 */
export default function NewMilestonePage() {
  const router = useRouter()
  const params = useParams()
  const memorialId = params.id as string
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memorialId || !user) return

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Determine approval status (Owner milestones are auto-approved)
      const { data: memorial } = await supabase
        .from('memorials')
        .select('owner_id')
        .eq('id', memorialId)
        .single()

      const isOwner = memorial?.owner_id === user.id
      const status = isOwner ? 'approved' : 'pending'

      const { error: insertError } = await supabase
        .from('milestones')
        .insert({
          memorial_id: memorialId,
          title,
          event_date: date?.toISOString() || null,
          description,
          location,
          submitted_by: user.id,
          status,
        })

      if (insertError) throw insertError

      router.push(`/memorials/${memorialId}?tab=timeline`)
    } catch (err: any) {
      setError(err.message || 'Failed to add milestone')
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
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Add Milestone</h1>
          <p className="text-lg text-muted-foreground font-medium">Capture a significant moment in their life story.</p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Event Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Graduation Day, First Job, Wedding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background border-border text-foreground h-14 rounded-xl font-medium text-lg"
                autoFocus
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Date of Event</Label>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Paris, France"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-background border-border text-foreground h-14 pl-11 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell the story behind this moment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed font-medium"
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
                disabled={loading || !title}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-[2] h-14 text-lg font-bold shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </span>
                ) : 'Add to Timeline'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}