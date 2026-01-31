'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Heart, Loader2, Plus } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useMemorials } from '@/lib/hooks/use-memorials'
import { useAuthSync } from '@/lib/hooks/use-auth'
import { formatDateShort } from '@/lib/utils/format'

import { ProfileDropdown } from '@/components/profile-dropdown'

/**
 * Dashboard page providing an overview of all memorials owned by or shared with the current user.
 */
export default function DashboardPage() {
  const router = useRouter()
  
  const { user, initialized } = useAuthStore()
  const { memorials, loading } = useMemorials()

  const myMemorials = memorials?.filter((m) => m.owner_id === user?.id) ?? []
  const contributedMemorials = memorials?.filter((m) => m.owner_id !== user?.id) ?? []

  if (!initialized || (loading && memorials.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-lg tracking-tight">Memorial</span>
          </Link>
          <div className="flex items-center gap-6">
            <ProfileDropdown />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Your Memorials</h1>
            <p className="text-lg text-muted-foreground font-medium">Honor and preserve the legacy of your loved ones.</p>
          </div>
          <Link href="/memorials/new">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12 font-bold shadow-sm">
              <Plus className="w-5 h-5 mr-2" /> Create Memorial
            </Button>
          </Link>
        </div>

        {/* User-Owned Memorials Section */}
        {myMemorials.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8 ml-1">Created by you</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myMemorials.map((memorial) => (
                <MemorialCard key={memorial.id} memorial={memorial} />
              ))}
            </div>
          </section>
        )}

        {/* Shared Memorials Section */}
        {contributedMemorials.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8 ml-1">Contributing to</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contributedMemorials.map((memorial) => (
                <MemorialCard key={memorial.id} memorial={memorial} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State when no memorials exist */}
        {memorials?.length === 0 && !loading && (
          <div className="p-20 bg-card border border-dashed border-border rounded-3xl text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">No memorials yet</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium">
              Create your first memorial to honor a loved one and preserve their story forever.
            </p>
            <Link href="/memorials/new">
              <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-14 text-lg font-bold shadow-sm">
                Create Your First Memorial
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Sub-component for individual memorial grid items.
 */
function MemorialCard({ memorial }: { memorial: any }) {
  return (
    <Link href={`/memorials/${memorial.id}`}>
      <Card className="group p-0 overflow-hidden bg-card border-border hover:border-primary/50 transition-all shadow-sm">
        {memorial.cover_image ? (
          <div
            className="w-full h-52 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${memorial.cover_image})` }}
          />
        ) : (
          <div className="w-full h-52 bg-secondary flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{memorial.name}</h3>
          {(memorial.birth_date || memorial.passing_date) && (
            <p className="text-muted-foreground text-sm font-bold tracking-wider uppercase opacity-70">
              {memorial.birth_date ? formatDateShort(memorial.birth_date) : '...'} — {memorial.passing_date ? formatDateShort(memorial.passing_date) : 'Present'}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
