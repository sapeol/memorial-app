import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Heart } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/sign-in')
  }

  // Get memorials where user is owner or participant
  const { data: memorials } = await supabase
    .from('memorials')
    .select(`
      *,
      memorial_participants!inner (
        access_level
      )
    `)
    .or(`owner_id.eq.${session.user.id},memorial_participants.user_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false })

  const myMemorials = memorials?.filter((m) => m.owner_id === session.user.id) ?? []
  const contributedMemorials = memorials?.filter((m) => m.owner_id !== session.user.id) ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-lg tracking-tight">Memorial</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground text-sm font-medium hidden sm:inline">{session.user.email}</span>
            <form action="/auth/sign-out" method="post">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium" type="submit">
                Sign Out
              </Button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Your Memorials</h1>
            <p className="text-lg text-muted-foreground">Honor and preserve the legacy of your loved ones.</p>
          </div>
          <Link href="/memorials/new">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12 font-medium">
              + Create Memorial
            </Button>
          </Link>
        </div>

        {/* Memorials I created */}
        {myMemorials.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1">Created by you</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myMemorials.map((memorial) => (
                <Link key={memorial.id} href={`/memorials/${memorial.id}`}>
                  <Card className="group p-0 overflow-hidden bg-card border-border hover:border-primary/50 transition-all shadow-sm">
                    {memorial.cover_image ? (
                      <div
                        className="w-full h-48 bg-cover bg-center transition-transform group-hover:scale-105"
                        style={{ backgroundImage: `url(${memorial.cover_image})` }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-secondary flex items-center justify-center">
                        <Heart className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{memorial.name}</h3>
                      {memorial.birth_date && (
                        <p className="text-muted-foreground text-sm font-medium">
                          {new Date(memorial.birth_date).toLocaleDateString()} — {memorial.passing_date ? new Date(memorial.passing_date).toLocaleDateString() : ''}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Memorials I contribute to */}
        {contributedMemorials.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1">Contributing to</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contributedMemorials.map((memorial) => (
                <Link key={memorial.id} href={`/memorials/${memorial.id}`}>
                  <Card className="group p-0 overflow-hidden bg-card border-border hover:border-primary/50 transition-all shadow-sm">
                    {memorial.cover_image ? (
                      <div
                        className="w-full h-48 bg-cover bg-center transition-transform group-hover:scale-105"
                        style={{ backgroundImage: `url(${memorial.cover_image})` }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-secondary flex items-center justify-center">
                        <Heart className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{memorial.name}</h3>
                      {memorial.birth_date && (
                        <p className="text-muted-foreground text-sm font-medium">
                          {new Date(memorial.birth_date).toLocaleDateString()} — {memorial.passing_date ? new Date(memorial.passing_date).toLocaleDateString() : ''}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {memorials?.length === 0 && (
          <div className="p-20 bg-card border border-dashed border-border rounded-3xl text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No memorials yet</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Create your first memorial to honor a loved one and preserve their story forever.
            </p>
            <Link href="/memorials/new">
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-14 text-lg font-medium">
                Create Your First Memorial
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
