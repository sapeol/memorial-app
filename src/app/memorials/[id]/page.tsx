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
    .select(`
      *,
      profiles:user_id (
        email
      )
    `)
    .eq('memorial_id', id)
    .order('created_at', { ascending: true })

  // Get milestones for timeline
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('memorial_id', id)
    .order('event_date', { ascending: true })

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
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          {memorial.cover_image && (
            <div
              className="w-full h-64 md:h-80 rounded-2xl bg-cover bg-center mb-6 relative"
              style={{ backgroundImage: `url(${memorial.cover_image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent rounded-2xl" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-foreground mb-2">{memorial.name}</h1>
              {memorial.birth_date && memorial.passing_date && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(memorial.birth_date).toLocaleDateString()} - {new Date(memorial.passing_date).toLocaleDateString()}
                  </span>
                  <span>({calculateAge(memorial.birth_date, memorial.passing_date)} years old)</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(isOwner || userAccessLevel === 'contributor') && (
                <>
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button variant="outline" size="sm" className="border-border">
                      <Timer className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </Link>
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button variant="outline" size="sm" className="border-border">
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
            <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">{memorial.bio}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted/50 border border-border w-full justify-start rounded-lg h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-background">
              Timeline ({milestones?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-background">
              Gallery ({mediaItems?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="guestbook" className="data-[state=active]:bg-background">
              Guestbook ({guestbookEntries?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="rituals" className="data-[state=active]:bg-background">
              Rituals ({rituals?.length ?? 0})
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="participants" className="data-[state=active]:bg-background">
                Participants ({participants?.length ?? 0})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Timeline Preview */}
              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-brand" />
                  Life Story
                </h3>
                {milestones && milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.slice(0, 3).map((milestone) => (
                      <div key={milestone.id} className="text-sm">
                        <p className="text-foreground font-medium">{milestone.title}</p>
                        <p className="text-muted-foreground">
                          {milestone.event_date ? new Date(milestone.event_date).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ))}
                    <Link href={`/memorials/${id}?tab=timeline`} className="text-brand-foreground text-sm hover:underline">
                      View all →
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No milestones added yet</p>
                )}
              </Card>

              {/* Gallery Preview */}
              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-brand" />
                  Memories
                </h3>
                {mediaItems && mediaItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaItems.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="aspect-square rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.url})` }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No photos added yet</p>
                )}
              </Card>

              {/* Guestbook Preview */}
              <Card className="p-6 bg-card/50 backdrop-blur border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand" />
                  Messages
                </h3>
                {guestbookEntries && guestbookEntries.length > 0 ? (
                  <div className="space-y-3">
                    {guestbookEntries.slice(0, 2).map((entry) => (
                      <div key={entry.id} className="text-sm">
                        <p className="text-foreground line-clamp-2">{entry.message}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {entry.author_name}
                        </p>
                      </div>
                    ))}
                    <Link href={`/memorials/${id}?tab=guestbook`} className="text-brand-foreground text-sm hover:underline">
                      View all →
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No messages yet</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <Card className="p-8 bg-card/50 backdrop-blur border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Life Story Timeline</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
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
          <TabsContent value="gallery" className="mt-6">
            <Card className="p-8 bg-card/50 backdrop-blur border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Media Gallery</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
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
          <TabsContent value="guestbook" className="mt-6">
            <Card className="p-8 bg-card/50 backdrop-blur border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Guestbook</h2>
                <Link href={`/memorials/${id}/guestbook/new`}>
                  <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
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
          <TabsContent value="rituals" className="mt-6">
            <Card className="p-8 bg-card/50 backdrop-blur border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Digital Rituals</h2>
                <Link href={`/memorials/${id}/rituals/new`}>
                  <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
                    Create Ritual
                  </Button>
                </Link>
              </div>

              {rituals && rituals.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {rituals.map((ritual) => (
                    <div key={ritual.id} className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        {ritual.ritual_type === 'candle' && <Flame className="w-5 h-5 text-brand" />}
                        {ritual.ritual_type === 'flower' && <Flower2 className="w-5 h-5 text-brand" />}
                        {ritual.ritual_type === 'heart' && <Heart className="w-5 h-5 text-brand" />}
                        <h3 className="font-semibold text-foreground">{ritual.message || 'Untitled'}</h3>
                      </div>
                      {ritual.guest_name && (
                        <p className="text-sm text-muted-foreground">by {ritual.guest_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {ritual.created_at ? `Created ${new Date(ritual.created_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No rituals created yet</p>
                  <Link href={`/memorials/${id}/rituals/new`}>
                    <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">
                      Create First Ritual
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Participants Tab - Owner only */}
          {isOwner && (
            <TabsContent value="participants" className="mt-6">
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
