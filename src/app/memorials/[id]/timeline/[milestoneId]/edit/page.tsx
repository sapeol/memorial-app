'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditMilestonePage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)
  const [milestoneId, setMilestoneId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    Promise.resolve(params).then(({ id, milestoneId }) => {
      setMemorialId(id)
      setMilestoneId(milestoneId)
      fetchMilestone(milestoneId)
    })
  }, [params])

  const fetchMilestone = async (id: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setTitle(data.title || '')
    setEventDate(data.event_date ? new Date(data.event_date) : undefined)
    setDescription(data.description || '')
    setLocation(data.location || '')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneId) return

    setError(null)
    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('milestones')
        .update({
          title,
          event_date: eventDate?.toISOString() || null,
          description: description || null,
          location: location || null,
        })
        .eq('id', milestoneId)

      if (error) throw error

      router.push(`/memorials/${memorialId}?tab=timeline`)
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone')
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Edit Milestone</h1>
          <p className="text-muted-foreground">Update this life event</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Graduation Day"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                value={eventDate}
                onChange={setEventDate}
                placeholder="Select date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., New York City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this milestone..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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
