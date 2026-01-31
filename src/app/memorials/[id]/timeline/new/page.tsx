'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { createClient } from '@/lib/supabase/client'

export default function NewMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memorialId, setMemorialId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

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

      // Check if user is owner
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Add Milestone</h1>
          <p className="text-muted-foreground">Add an important moment to the life story timeline</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Graduation Day, Wedding, First Job"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  value={date}
                  onChange={setDate}
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Share details about this milestone..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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
                {loading ? 'Adding...' : 'Add Milestone'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
