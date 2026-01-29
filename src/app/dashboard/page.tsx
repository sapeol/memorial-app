import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
              <span className="text-slate-900 text-sm">✦</span>
            </div>
            <span className="text-white font-medium">Memorial</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm">{session.user.email}</span>
            <form action="/auth/sign-out" method="post">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Your Memorials</h1>
            <p className="text-zinc-400">Manage and view the memorials you've created and contribute to</p>
          </div>
          <Link href="/memorials/new">
            <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900">
              + Create Memorial
            </Button>
          </Link>
        </div>

        {/* Memorials I created */}
        {myMemorials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-medium text-white mb-4">Created by you</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMemorials.map((memorial) => (
                <Link key={memorial.id} href={`/memorials/${memorial.id}`}>
                  <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    {memorial.cover_image && (
                      <div
                        className="w-full h-32 rounded-md bg-cover bg-center mb-4"
                        style={{ backgroundImage: `url(${memorial.cover_image})` }}
                      />
                    )}
                    <h3 className="text-lg font-semibold text-white mb-1">{memorial.name}</h3>
                    {memorial.birth_date && (
                      <p className="text-zinc-500 text-sm">
                        {memorial.birth_date ? new Date(memorial.birth_date).toLocaleDateString() : ''} - {memorial.passing_date ? new Date(memorial.passing_date).toLocaleDateString() : ''}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Memorials I contribute to */}
        {contributedMemorials.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-white mb-4">Contributing to</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributedMemorials.map((memorial) => (
                <Link key={memorial.id} href={`/memorials/${memorial.id}`}>
                  <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    {memorial.cover_image && (
                      <div
                        className="w-full h-32 rounded-md bg-cover bg-center mb-4"
                        style={{ backgroundImage: `url(${memorial.cover_image})` }}
                      />
                    )}
                    <h3 className="text-lg font-semibold text-white mb-1">{memorial.name}</h3>
                    {memorial.birth_date && (
                      <p className="text-zinc-500 text-sm">
                        {memorial.birth_date ? new Date(memorial.birth_date).toLocaleDateString() : ''} - {memorial.passing_date ? new Date(memorial.passing_date).toLocaleDateString() : ''}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {memorials?.length === 0 && (
          <Card className="p-12 bg-white/5 border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✦</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No memorials yet</h2>
            <p className="text-zinc-400 mb-6">Create your first memorial to honor a loved one</p>
            <Link href="/memorials/new">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900">
                Create Your First Memorial
              </Button>
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
