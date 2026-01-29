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
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Invite Contributors</h1>
          <p className="text-muted-foreground">
            Invite friends and family to contribute to this memorial
          </p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur border-border">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to generate a shareable link without sending an email
                </p>
              </div>

              <div className="space-y-2">
                <Label>Access Level</Label>
                <div className="space-y-2">
                  {ACCESS_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setAccessLevel(level.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        accessLevel === level.value
                          ? 'border-brand bg-brand/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="font-semibold text-foreground">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal note to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="bg-brand text-brand-foreground hover:bg-brand-hover"
              >
                {loading ? 'Creating...' : 'Generate Invitation'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Invitation Created!</h2>
                <p className="text-muted-foreground">
                  Share this link with friends and family to invite them to contribute to the memorial for {memorialName}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm text-muted-foreground mb-2">Invitation Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-background px-3 py-2 rounded overflow-hidden text-ellipsis">
                    {generatedLink}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="border-border shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                    setMessage('')
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Create Another
                </Button>
                <Button
                  onClick={() => router.push(`/memorials/${memorialId}`)}
                  className="bg-brand text-brand-foreground hover:bg-brand-hover"
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
