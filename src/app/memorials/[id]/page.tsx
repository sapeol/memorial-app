'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ParticipantsList } from '@/components/participants-list'
import { InviteButton } from '@/components/invite-button'
import { TimelineItems } from '@/components/timeline-items'
import { MediaGrid } from '@/components/media-grid'
import { GuestbookEntries } from '@/components/guestbook-entries'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Calendar, Flame, MessageSquare, Image, Timer, Flower2, Heart, Loader2, ArrowLeft } from 'lucide-react'
import { useMemorial } from '@/lib/hooks/use-memorials'
import { useAuthStore } from '@/lib/store/auth-store'
import { useAuthSync } from '@/lib/hooks/use-auth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateShort } from '@/lib/utils/format'

/**
 * Detailed memorial page displaying the life story, gallery, guestbook, and rituals.
 * Uses custom hooks for data management and global state for authentication.
 */
export default function MemorialPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  
  const { user, initialized } = useAuthStore()
  
  // Local memorial data fetching via custom hook
  const { memorial, loading, error } = useMemorial(id)
  
  // Local state for related entities
  const [participants, setParticipants] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [guestbookEntries, setGuestbookEntries] = useState<any[]>([])
  const [rituals, setRituals] = useState<any[]>([])

  /**
   * Effect: Fetch related details for the memorial once the core record is available.
   * Fetches participants, milestones, media, guestbook, and rituals in parallel.
   */
  useEffect(() => {
    async function fetchDetails() {
      if (!memorial) return
      const supabase = createClient()

      try {
        const [p, m, mi, g, r] = await Promise.all([
          supabase.from('memorial_participants').select('*').eq('memorial_id', id).order('created_at', { ascending: true }),
          supabase.from('milestones').select('*').eq('memorial_id', id).order('event_date', { ascending: true }),
          supabase.from('media_items').select('*').eq('memorial_id', id).order('created_at', { ascending: false }),
          supabase.from('guestbook_entries').select('*').eq('memorial_id', id).order('created_at', { ascending: false }),
          supabase.from('rituals').select('*').eq('memorial_id', id).order('created_at', { ascending: false })
        ])

        if (p.data) setParticipants(p.data)
        if (m.data) setMilestones(m.data)
        if (mi.data) setMediaItems(mi.data)
        if (g.data) setGuestbookEntries(g.data)
        if (r.data) setRituals(r.data)
      } catch (err) {
        console.error('Failed to fetch memorial details:', err)
      }
    }

    fetchDetails()
  }, [id, memorial])

  // Loading state with serene backdrop
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  // Error handling or missing memorial
  if (error || !memorial) {
    router.push('/dashboard')
    return null
  }

  // Access control checks
  const isOwner = memorial.owner_id === user?.id
  const userAccessLevel = memorial.memorial_participants?.[0]?.access_level || (isOwner ? 'owner' : 'visitor')

  /**
   * Utility: Calculate age based on birth and passing dates.
   */
  const calculateAge = (birthDate: string, passingDate: string) => {
    const birth = new Date(birthDate)
    const passing = new Date(passingDate)
    let age = passing.getFullYear() - birth.getFullYear()
    const m = passing.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && passing.getDate() < birth.getDate())) age--
    return age
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header with Navigation and Profile */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <div className="flex items-center gap-6">
            <ProfileDropdown />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Memorial Hero Section: Cover Image and Identity */}
        <div className="mb-16">
          {memorial.cover_image && (
            <div
              className="w-full h-80 md:h-[450px] rounded-[40px] bg-cover bg-center mb-12 relative overflow-hidden border border-border shadow-sm"
              style={{ backgroundImage: `url(${memorial.cover_image})` }}
            >
              <div className="absolute inset-0 bg-black/5" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter">{memorial.name}</h1>
              {memorial.birth_date && memorial.passing_date && (
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-secondary border border-border rounded-full shadow-sm">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-foreground uppercase tracking-widest">
                      {formatDateShort(memorial.birth_date)} — {formatDateShort(memorial.passing_date)}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-60">
                    {calculateAge(memorial.birth_date, memorial.passing_date)} years of life
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons for Contributors */}
            <div className="flex flex-wrap gap-4">
              {(isOwner || userAccessLevel === 'contributor') && (
                <>
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button variant="outline" size="sm" className="border-border rounded-full px-6 font-bold cursor-pointer h-11">
                      <Timer className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </Link>
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button variant="outline" size="sm" className="border-border rounded-full px-6 font-bold cursor-pointer h-11">
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

          {/* Biography/Tribute Statement */}
          {memorial.bio && (
            <div className="mt-12 p-8 md:p-12 bg-card border border-border rounded-[32px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium italic">"{memorial.bio}"</p>
            </div>
          )}
        </div>

        {/* Modular Content Sections via Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-secondary/50 border border-border w-full justify-start rounded-2xl h-auto p-1.5 mb-12 overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">Overview</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
              Timeline ({milestones?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
              Gallery ({mediaItems?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="guestbook" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
              Guestbook ({guestbookEntries?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="rituals" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
              Rituals ({rituals?.length ?? 0})
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="participants" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-8 py-3 font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                Access ({participants?.length ?? 0})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Section: Previews of main content */}
          <TabsContent value="overview" className="mt-0 outline-none">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Timeline Preview */}
              <PreviewCard 
                title="Life Story" 
                icon={Timer} 
                href={`/memorials/${id}?tab=timeline`}
                empty={!milestones.length}
                emptyText="No milestones added yet"
              >
                <div className="space-y-5">
                  {milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="group/item">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{formatDateShort(m.event_date)}</p>
                      <p className="text-foreground font-bold text-lg group-hover/item:text-primary transition-colors">{m.title}</p>
                    </div>
                  ))}
                </div>
              </PreviewCard>

              {/* Gallery Preview */}
              <PreviewCard 
                title="Memories" 
                icon={Image} 
                href={`/memorials/${id}?tab=gallery`}
                empty={!mediaItems.length}
                emptyText="No photos added yet"
              >
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-xl bg-cover bg-center border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      style={{ backgroundImage: `url(${item.url})` }}
                    />
                  ))}
                </div>
              </PreviewCard>

              {/* Guestbook Preview */}
              <PreviewCard 
                title="Messages" 
                icon={MessageSquare} 
                href={`/memorials/${id}?tab=guestbook`}
                empty={!guestbookEntries.length}
                emptyText="No messages yet"
              >
                <div className="space-y-5">
                  {guestbookEntries.slice(0, 2).map((entry) => (
                    <div key={entry.id} className="bg-secondary/30 p-5 rounded-2xl border border-border/50">
                      <p className="text-foreground line-clamp-2 leading-relaxed font-semibold italic text-sm">"{entry.message}"</p>
                      <p className="text-muted-foreground text-[10px] mt-3 font-black uppercase tracking-widest">
                        — {entry.author_name}
                      </p>
                    </div>
                  ))}
                </div>
              </PreviewCard>
            </div>
          </TabsContent>

          {/* Full Lifecycle Content Tabs */}
          <TabsContent value="timeline" className="mt-0 outline-none">
            <Card className="p-10 md:p-16 bg-card border border-border rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Life Story Timeline</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/timeline/new`}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 font-bold cursor-pointer shadow-sm">
                      Add Milestone
                    </Button>
                  </Link>
                )}
              </div>
              <TimelineItems milestones={milestones} memorialId={id} currentUserId={user?.id || ''} isOwner={isOwner} />
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-0 outline-none">
            <Card className="p-10 md:p-16 bg-card border border-border rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Media Gallery</h2>
                {(isOwner || userAccessLevel === 'contributor') && (
                  <Link href={`/memorials/${id}/media/new`}>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 font-bold cursor-pointer shadow-sm">
                      Add Photo
                    </Button>
                  </Link>
                )}
              </div>
              <MediaGrid mediaItems={mediaItems} memorialId={id} currentUserId={user?.id || ''} isOwner={isOwner} canAdd={isOwner || userAccessLevel === 'contributor'} />
            </Card>
          </TabsContent>

          <TabsContent value="guestbook" className="mt-0 outline-none">
            <Card className="p-10 md:p-16 bg-card border border-border rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Guestbook</h2>
                <Link href={`/memorials/${id}/guestbook/new`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 font-bold cursor-pointer shadow-sm">
                    Leave Message
                  </Button>
                </Link>
              </div>
              <GuestbookEntries entries={guestbookEntries} memorialId={id} currentUserId={user?.id || ''} isOwner={isOwner} />
            </Card>
          </TabsContent>

          {/* Rituals: Virtual tributes */}
          <TabsContent value="rituals" className="mt-0 outline-none">
            <Card className="p-10 md:p-16 bg-card border border-border rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Digital Rituals</h2>
                <Link href={`/memorials/${id}/rituals/new`}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 font-bold cursor-pointer shadow-sm">
                    Create Ritual
                  </Button>
                </Link>
              </div>

              {rituals.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rituals.map((ritual) => (
                    <div key={ritual.id} className="p-8 rounded-[32px] bg-secondary/20 border border-border shadow-sm hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-inner">
                          {ritual.ritual_type === 'candle' && <Flame className="w-6 h-6 text-primary" />}
                          {ritual.ritual_type === 'flower' && <Flower2 className="w-6 h-6 text-primary" />}
                          {ritual.ritual_type === 'heart' && <Heart className="w-6 h-6 text-primary" />}
                        </div>
                        <h3 className="font-bold text-foreground text-lg leading-tight">{ritual.message || 'Sent with Love'}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-70">from {ritual.guest_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-6 font-black uppercase tracking-[0.2em] opacity-40">
                        {ritual.created_at ? new Date(ritual.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-secondary/10 rounded-[40px] border border-dashed border-border">
                  <Flame className="w-20 h-20 text-muted-foreground/20 mx-auto mb-8" />
                  <p className="text-xl text-muted-foreground font-bold mb-10">No rituals created yet</p>
                  <Link href={`/memorials/${id}/rituals/new`}>
                    <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-14 font-bold shadow-sm cursor-pointer">
                      Create First Ritual
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Access Control (Owner only) */}
          {isOwner && (
            <TabsContent value="participants" className="mt-0 outline-none">
              <ParticipantsList
                memorialId={id}
                memorialName={memorial.name}
                ownerId={memorial.owner_id}
                participants={participants}
                currentUserId={user?.id || ''}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

/**
 * Shared preview card component for the overview dashboard.
 */
function PreviewCard({ title, icon: Icon, href, children, empty, emptyText }: { 
  title: string, 
  icon: any, 
  href: string, 
  children: React.ReactNode, 
  empty: boolean, 
  emptyText: string 
}) {
  return (
    <Card className="p-10 bg-card border border-border rounded-[32px] shadow-sm flex flex-col h-full">
      <h3 className="font-black text-muted-foreground mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
        <Icon className="w-5 h-5 text-primary opacity-70" />
        {title}
      </h3>
      <div className="flex-1">
        {empty ? (
          <p className="text-muted-foreground text-sm font-bold opacity-40 italic">{emptyText}</p>
        ) : children}
      </div>
      <Link href={href} className="text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:underline inline-flex items-center gap-2 mt-8 cursor-pointer">
        Explore more <span className="text-base">→</span>
      </Link>
    </Card>
  )
}
