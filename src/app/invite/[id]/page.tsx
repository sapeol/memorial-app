import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Mail, Check, AlertCircle } from 'lucide-react'

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get invitation
  const { data: invitation } = await supabase
    .from('invitations')
    .select(`
      *,
      memorials (
        name
      ),
      invited_by_user (
        email
      )
    `)
    .eq('id', id)
    .single()

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-card to-background p-6">
        <Card className="w-full max-w-md p-8 bg-card/50 backdrop-blur border-border text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Invitation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This invitation may have expired or been cancelled.
          </p>
          <Link href="/">
            <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">
              Go to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Check if expired
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-card to-background p-6">
        <Card className="w-full max-w-md p-8 bg-card/50 backdrop-blur border-border text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Invitation Expired</h1>
          <p className="text-muted-foreground mb-6">
            This invitation has expired. Please contact the memorial owner for a new invitation.
          </p>
          <Link href="/">
            <Button className="bg-brand text-brand-foreground hover:bg-brand-hover">
              Go to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // If logged in, accept the invitation directly
  if (session?.user) {
    // Check if already a participant
    const { data: existingParticipant } = await supabase
      .from('memorial_participants')
      .select('*')
      .eq('memorial_id', invitation.memorial_id)
      .eq('user_id', session.user.id)
      .single()

    if (!existingParticipant) {
      // Add as participant
      await supabase.from('memorial_participants').insert({
        memorial_id: invitation.memorial_id,
        user_id: session.user.id,
        access_level: invitation.access_level,
        invited_by: invitation.invited_by,
        accepted_at: new Date().toISOString(),
      })
    }

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', id)

    redirect(`/memorials/${invitation.memorial_id}`)
  }

  // Show sign-in/up page for anonymous users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-card to-background p-6">
      <Card className="w-full max-w-md p-8 bg-card/50 backdrop-blur border-border text-center">
        <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand-foreground" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          You're Invited!
        </h1>
        <p className="text-muted-foreground mb-2">
          You have been invited to contribute to the memorial for{' '}
          <span className="font-semibold text-foreground">
            {invitation.memorials?.name || 'a loved one'}
          </span>
        </p>

        <div className="my-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            {invitation.access_level === 'contributor'
              ? 'As a contributor, you will be able to add photos, milestones, and guestbook entries.'
              : 'As a visitor, you will be able to view the memorial and sign the guestbook.'}
          </p>
        </div>

        <div className="space-y-3">
          <Link href={`/sign-in?redirect=/invite/${id}`}>
            <Button className="w-full bg-brand text-brand-foreground hover:bg-brand-hover">
              Sign In to Accept
            </Button>
          </Link>
          <Link href={`/sign-up?redirect=/invite/${id}`}>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
              Create Account
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          By accepting, you agree to be respectful and mindful when contributing.
        </p>
      </Card>
    </div>
  )
}
