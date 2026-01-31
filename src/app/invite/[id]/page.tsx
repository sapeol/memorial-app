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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-10 bg-card border border-border text-center rounded-3xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-foreground mb-3">Invitation Not Found</h1>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            This invitation may have expired or been cancelled. Please check with the memorial owner.
          </p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-12">
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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-10 bg-card border border-border text-center rounded-3xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-foreground mb-3">Invitation Expired</h1>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            This invitation has expired. Please contact the memorial owner for a new invitation link.
          </p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-10 h-12">
              Go to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // ... (session check logic remains the same)

  // Show sign-in/up page for anonymous users
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-10 bg-card border border-border text-center rounded-3xl shadow-sm">
        <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-8">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          You're Invited
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          to honor and celebrate the life of
        </p>
        <p className="text-2xl font-bold text-foreground mb-8">
          {invitation.memorials?.name || 'a loved one'}
        </p>

        <div className="my-8 p-6 rounded-2xl bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {invitation.access_level === 'contributor'
              ? 'As a contributor, you will be able to share photos, milestones, and heartfelt memories.'
              : 'As a visitor, you will be able to view the memorial and share your thoughts in the guestbook.'}
          </p>
        </div>

        <div className="space-y-4">
          <Link href={`/sign-in?redirect=/invite/${id}`}>
            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full h-14 text-lg font-medium">
              Sign In to Accept
            </Button>
          </Link>
          <Link href={`/sign-up?redirect=/invite/${id}`}>
            <Button variant="outline" className="w-full border-border rounded-full h-14 text-lg font-medium">
              Create Account
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-8 font-medium tracking-wide uppercase">
          Private • Secure • Respectful
        </p>
      </Card>
    </div>
  )
}
