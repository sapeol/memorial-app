'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Mail, Copy, Check, ArrowLeft, Loader2 } from 'lucide-react'

const ACCESS_LEVELS = [
  { value: 'contributor', label: 'Contributor', description: 'Can add photos, milestones, and guestbook entries' },
  { value: 'visitor', label: 'Visitor', description: 'Can view and sign guestbook' },
] as const

/**
 * Page for generating and managing memorial invitations.
 * Optimized for mobile sharing and animated with Framer Motion.
 */
export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const memorialId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [memorialName, setMemorialName] = useState<string>('')
  const [generatedLink, setGeneratedLink] = useState<string>('')

  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<'contributor' | 'visitor'>('contributor')
  const [message, setMessage] = useState('')

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

      const { data: memorial } = await supabase
        .from('memorials')
        .select('name, owner_id')
        .eq('id', memorialId)
        .single()

      if (!memorial) throw new Error('Memorial not found')
      if (memorial.owner_id !== user.id) throw new Error('Only the owner can send invitations')

      setMemorialName(memorial.name)

      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

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

      const inviteLink = `${window.location.origin}/invite/${invitation.id}`
      setGeneratedLink(inviteLink)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation')
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">Invite Contributors</h1>
                <p className="text-lg text-muted-foreground font-medium">
                  Invite friends and family to join this private memorial.
                </p>
              </div>

              <Card className="p-10 bg-card border border-border rounded-[32px] shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border text-foreground h-12 rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Level</Label>
                    <div className="space-y-3">
                      {ACCESS_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setAccessLevel(level.value)}
                          className={`w-full p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            accessLevel === level.value
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/20'
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
                      className="bg-background border-border text-foreground rounded-2xl p-5 leading-relaxed font-medium focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 shake">
                      <p className="text-destructive text-sm font-bold">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full h-14 text-lg font-bold shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </span>
                    ) : 'Generate Invitation'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <Card className="p-8 md:p-10 bg-card border border-border rounded-[40px] shadow-lg overflow-hidden">
                <div className="flex flex-col gap-10">
                  {/* Share Link is top-most on mobile by being the first major block */}
                  <div className="order-1 md:order-2 space-y-4">
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 ml-1">Private Invitation Link</p>
                      <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <code className="flex-1 text-sm bg-background px-5 py-4 rounded-2xl overflow-hidden text-ellipsis border border-border font-bold text-primary">
                          {generatedLink}
                        </code>
                        <Button
                          type="button"
                          onClick={handleCopyLink}
                          className="bg-primary text-primary-foreground rounded-2xl h-14 px-8 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                        >
                          {copied ? (
                            <><Check className="w-5 h-5 mr-2" /> Copied</>
                          ) : (
                            <><Copy className="w-5 h-5 mr-2" /> Copy Link</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="order-2 md:order-1 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto shadow-inner">
                      <Mail className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">Invitation Ready</h2>
                      <p className="text-lg text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                        Share this private link with loved ones to invite them to {memorialName}'s memorial.
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="order-3 flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSuccess(false)
                        setEmail('')
                        setMessage('')
                      }}
                      className="border-border rounded-full flex-1 h-12 font-bold cursor-pointer"
                    >
                      Create Another
                    </Button>
                    <Button
                      onClick={() => router.push(`/memorials/${memorialId}`)}
                      className="bg-primary text-primary-foreground hover:opacity-90 rounded-full flex-1 h-12 font-bold cursor-pointer"
                    >
                      Return to Memorial
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}