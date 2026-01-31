'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Mail, Copy, Check } from 'lucide-react'

const ACCESS_LEVELS = [
  { value: 'contributor', label: 'Contributor', description: 'Can add photos, milestones, and guestbook entries' },
  { value: 'visitor', label: 'Visitor', description: 'Can view and sign guestbook' },
] as const

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [memorialId, setMemorialId] = useState<string | null>(null)
  const [memorialName, setMemorialName] = useState<string>('')
  const [generatedLink, setGeneratedLink] = useState<string>('')

  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<'contributor' | 'visitor'>('contributor')
  const [message, setMessage] = useState('')

  useState(() => {
    Promise.resolve(params).then(({ id }) => setMemorialId(id))
  })

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

      // Get memorial details
      const { data: memorial } = await supabase
        .from('memorials')
        .select('name, owner_id')
        .eq('id', memorialId)
        .single()

      if (!memorial) {
        throw new Error('Memorial not found')
      }

      if (memorial.owner_id !== user.id) {
        throw new Error('Only the owner can send invitations')
      }

      setMemorialName(memorial.name)

      // Generate access code
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Calculate expiration (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          memorial_id: memorialId,
          email: email || null,
          access_code: accessCode,
          access_level: accessLevel,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // Generate invite link
      const inviteLink = `${window.location.origin}/invite/${invitation.id}`
      setGeneratedLink(inviteLink)

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight mb-3">Invite Contributors</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Invite friends and family to join this private memorial.
          </p>
        </div>

        <Card className="p-10 bg-card border border-border rounded-3xl shadow-sm">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                />
                <p className="text-xs text-muted-foreground ml-1 font-medium">
                  Leave empty to generate a shareable private link.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Level</Label>
                <div className="space-y-3">
                  {ACCESS_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setAccessLevel(level.value)}
                      className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                        accessLevel === level.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/20 hover:bg-secondary/20'
                      }`}
                    >
                      <div className="font-bold text-foreground text-lg mb-1">{level.label}</div>
                      <div className="text-sm text-muted-foreground font-medium leading-relaxed">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal note to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-2xl p-4 leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full h-14 text-lg font-medium shadow-sm"
              >
                {loading ? 'Creating...' : 'Generate Invitation'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-8">
              <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">Invitation Created</h2>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                  Share this link with those you want to invite to {memorialName}'s memorial.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/30 border border-border text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 ml-1">Private Invitation Link</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm bg-background px-4 py-3 rounded-xl overflow-hidden text-ellipsis border border-border font-medium">
                    {generatedLink}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="border-border rounded-xl h-11 px-4 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                    setMessage('')
                  }}
                  className="border-border rounded-full flex-1 h-12 font-medium"
                >
                  Create Another
                </Button>
                <Button
                  onClick={() => router.push(`/memorials/${memorialId}`)}
                  className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-1 h-12 font-medium"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
