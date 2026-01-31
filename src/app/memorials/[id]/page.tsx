import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InviteModal } from '@/components/invite-modal'
import { ParticipantsList } from '@/components/participants-list'
import { InviteButton } from '@/components/invite-button'
import { TimelineItems } from '@/components/timeline-items'
import { MediaGrid } from '@/components/media-grid'
import { GuestbookEntries } from '@/components/guestbook-entries'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Calendar, MapPin, Flame, MessageSquare, Image, Timer, Flower2, Heart, Users, Mail, Shield, Edit, Trash2 } from 'lucide-react'

export default async function MemorialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/sign-in?redirect=/memorials/${id}`)
  }

  // Get memorial with access check
  const { data: memorial } = await supabase
    .from('memorials')
    .select(`
      *,
      memorial_participants!inner (
        access_level
      )
    `)
    .eq('id', id)
    .or(`owner_id.eq.${session.user.id},memorial_participants.user_id.eq.${session.user.id}`)
    .single()

  if (!memorial) {
    redirect('/dashboard')
  }

  const isOwner = memorial.owner_id === session.user.id
  const userAccessLevel = memorial.memorial_participants?.[0]?.access_level || (isOwner ? 'owner' : 'visitor')

  // Get participants for the memorial
  const { data: participants } = await supabase
    .from('memorial_participants')
    .select('*')
    .eq('memorial_id', id)
    .order('created_at', { ascending: true })

  // Get milestones for timeline
  let milestoneQuery = supabase
    .from('milestones')
    .select('*')
    .eq('memorial_id', id)
    .order('event_date', { ascending: true })

  if (!isOwner) {
    milestoneQuery = milestoneQuery.or(`status.eq.approved,submitted_by.eq.${session.user.id}`)
  }

  const { data: milestones } = await milestoneQuery

  // Get media items
  const { data: mediaItems } = await supabase
    .from('media_items')
    .select('*')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  // Get guestbook entries
  const { data: guestbookEntries } = await supabase
    .from('guestbook_entries')
    .select('*')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  // Get rituals
  const { data: rituals } = await supabase
    .from('rituals')
    .select('*')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  const calculateAge = (birthDate: string, passingDate: string) => {
    const birth = new Date(birthDate)
    const passing = new Date(passingDate)
    let age = passing.getFullYear() - birth.getFullYear()
    const m = passing.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && passing.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-medium flex items-center gap-2 transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          {memorial.cover_image && (
            <div
              className="w-full h-72 md:h-96 rounded-3xl bg-cover bg-center mb-10 relative overflow-hidden border border-border"
              style={{ backgroundImage: `url(${memorial.cover_image})` }}
            >
              <div className="absolute inset-0 bg-black/10" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">{memorial.name}</h1>
              {memorial.birth_date && memorial.passing_date && (
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {new Date(memorial.birth_date).toLocaleDateString()} — {new Date(memorial.passing_date).toLocaleDateString()}
                  </span>
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm">
                    {calculateAge(memorial.birth_date, memorial.passing_date)} years old
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {(isOwner || userAccessLevel === 'contributor') && (
                <>
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button variant="outline" size="sm" className="border-border rounded-full px-5">
                      <Timer className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </Link>
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button variant="outline" size="sm" className="border-border rounded-full px-5">
                      <Image className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                  </Link>
                </>
              )}
              {isOwner && (
                <InviteButton memorialId={id} memorialName={memorial.name} />
              )}
            </div>
          </div>

          {memorial.bio && (
            <div className="mt-8 p-6 bg-card border border-border rounded-2xl">
              <p className="text-lg text-muted-foreground leading-relaxed italic">"{memorial.bio}"</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-secondary/50 border border-border w-full justify-start rounded-xl h-auto p-1.5 mb-8">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">Overview</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">
              Timeline ({milestones?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">
              Gallery ({mediaItems?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="guestbook" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">
              Guestbook ({guestbookEntries?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="rituals" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">
              Rituals ({rituals?.length ?? 0})
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="participants" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 py-2.5 font-medium">
                Participants ({participants?.length ?? 0})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Timeline Preview */}
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-3 text-lg">
                  <Timer className="w-6 h-6 text-primary" />
                  Life Story
                </h3>
                {milestones && milestones.length > 0 ? (
                  <div className="space-y-4">
                    {milestones.slice(0, 3).map((milestone) => (
                      <div key={milestone.id} className="text-sm">
                        <p className="text-foreground font-semibold">{milestone.title}</p>
                        <p className="text-muted-foreground mt-1">
                          {milestone.event_date ? new Date(milestone.event_date).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ))}
                    <Link href={`/memorials/${id}?tab=timeline`} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 mt-2">
                      View all timeline <span className="text-lg">→</span>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No milestones added yet</p>
                )}
              </Card>

              {/* Gallery Preview */}
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-3 text-lg">
                  <Image className="w-6 h-6 text-primary" />
                  Memories
                </h3>
                {mediaItems && mediaItems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {mediaItems.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="aspect-square rounded-lg bg-cover bg-center border border-border/50"
                          style={{ backgroundImage: `url(${item.url})` }}
                        />
                      ))}
                    </div>
                    <Link href={`/memorials/${id}?tab=gallery`} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 mt-2">
                      View gallery <span className="text-lg">→</span>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No photos added yet</p>
                )}
              </Card>

              {/* Guestbook Preview */}
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-sm">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-3 text-lg">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Messages
                </h3>
                {guestbookEntries && guestbookEntries.length > 0 ? (
                  <div className="space-y-4">
                    {guestbookEntries.slice(0, 2).map((entry) => (
                      <div key={entry.id} className="text-sm bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <p className="text-foreground line-clamp-2 leading-relaxed font-medium">"{entry.message}"</p>
                        <p className="text-muted-foreground text-xs mt-2 font-bold uppercase tracking-wider">
                          — {entry.author_name}
                        </p>
                      </div>
                    ))}
                    <Link href={`/memorials/${id}?tab=guestbook`} className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1 mt-2">
                      Read guestbook <span className="text-lg">→</span>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No messages yet</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0">
            <Card className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-foreground">Life Story Timeline</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6">
                      Add Milestone
                    </Button>
                  </Link>
                )}
              </div>

              <TimelineItems
                milestones={milestones || []}
                memorialId={id}
                currentUserId={session.user.id}
                isOwner={isOwner}
              />
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-0">
            <Card className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-foreground">Media Gallery</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6">
                      Add Photo
                    </Button>
                  </Link>
                )}
              </div>

              <MediaGrid
                mediaItems={mediaItems || []}
                memorialId={id}
                currentUserId={session.user.id}
                isOwner={isOwner}
                canAdd={isOwner || userAccessLevel === 'contributor'}
              />
            </Card>
          </TabsContent>

          {/* Guestbook Tab */}
          <TabsContent value="guestbook" className="mt-0">
            <Card className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-foreground">Guestbook</h2>
                <Link href={`/memorials/${id}/guestbook/new`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6">
                    Leave Message
                  </Button>
                </Link>
              </div>

              <GuestbookEntries
                entries={guestbookEntries || []}
                memorialId={id}
                currentUserId={session.user.id}
                isOwner={isOwner}
              />
            </Card>
          </TabsContent>

          {/* Rituals Tab */}
          <TabsContent value="rituals" className="mt-0">
            <Card className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-semibold text-foreground">Digital Rituals</h2>
                <Link href={`/memorials/${id}/rituals/new`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6">
                    Create Ritual
                  </Button>
                </Link>
              </div>

              {rituals && rituals.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rituals.map((ritual) => (
                    <div key={ritual.id} className="p-6 rounded-2xl bg-secondary/20 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                          {ritual.ritual_type === 'candle' && <Flame className="w-5 h-5 text-primary" />}
                          {ritual.ritual_type === 'flower' && <Flower2 className="w-5 h-5 text-primary" />}
                          {ritual.ritual_type === 'heart' && <Heart className="w-5 h-5 text-primary" />}
                        </div>
                        <h3 className="font-semibold text-foreground">{ritual.message || 'Sent with Love'}</h3>
                      </div>
                      {ritual.guest_name && (
                        <p className="text-sm text-muted-foreground font-medium">from {ritual.guest_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-4 font-bold uppercase tracking-wider">
                        {ritual.created_at ? new Date(ritual.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
                  <Flame className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                  <p className="text-lg text-muted-foreground mb-8">No rituals created yet</p>
                  <Link href={`/memorials/${id}/rituals/new`}>
                    <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12">
                      Create First Ritual
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Participants Tab - Owner only */}
          {isOwner && (
            <TabsContent value="participants" className="mt-0">
              <ParticipantsList
                memorialId={id}
                memorialName={memorial.name}
                ownerId={memorial.owner_id}
                participants={participants || []}
                currentUserId={session.user.id}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
