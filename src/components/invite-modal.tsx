'use client'

import { useState } from 'react'
import { X, Mail, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card } from './ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { createClient } from '@/lib/supabase/client'

interface InviteModalProps {
  memorialId: string
  memorialName: string
  onClose: () => void
  onInvited?: () => void
}

export function InviteModal({ memorialId, memorialName, onClose, onInvited }: InviteModalProps) {
  const [step, setStep] = useState<'link' | 'email'>('link')
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<'contributor' | 'visitor'>('visitor')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInviteLink = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in')
        return
      }

      // Generate a random access code
      const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          memorial_id: memorialId,
          invited_by: user.id,
          access_code: accessCode,
          access_level: accessLevel,
          // Expire in 30 days
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // Generate invite link
      const baseUrl = window.location.origin
      setInviteLink(`${baseUrl}/invite/${invitation.id}`)
      setStep('link')
    } catch (err: any) {
      setError(err.message || 'Failed to generate invite link')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailInvite = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in')
        return
      }

      if (!email) {
        setError('Please enter an email address')
        return
      }

      // Generate a random access code
      const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Create invitation with email
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          memorial_id: memorialId,
          invited_by: user.id,
          email,
          access_code: accessCode,
          access_level: accessLevel,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (inviteError) throw inviteError

      // Generate invite link for email
      const baseUrl = window.location.origin
      const link = `${baseUrl}/invite/${invitation.id}`

      // In a real app, you'd send an email via a server action
      // For now, copy the link to clipboard
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setInviteLink(link)
      setStep('link')

      onInvited?.()
    } catch (err: any) {
      setError(err.message || 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border-border p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Invite to Memorial</h2>
            <p className="text-sm text-muted-foreground font-medium">{memorialName}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-6">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {inviteLink ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-secondary/30 border border-border">
              <p className="text-sm text-muted-foreground font-medium mb-3">Share this private link with your loved ones:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-2 rounded-xl bg-background border border-border text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-border rounded-xl shrink-0 h-10"
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
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              This link will expire in 30 days. The invitee will have <span className="text-foreground">{accessLevel === 'contributor' ? 'contributor' : 'visitor'}</span> access.
            </p>
            <Button onClick={onClose} className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full h-12 font-medium">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex p-1 bg-secondary/50 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setStep('link')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${step === 'link' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Copy Link
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${step === 'email' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Send Email
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Level</Label>
              <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="visitor">Visitor — View & Sign</SelectItem>
                  <SelectItem value="contributor">Contributor — Add Photos & Stories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {step === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border h-12 rounded-xl"
                />
              </div>
            )}

            <Button
              onClick={step === 'email' ? sendEmailInvite : generateInviteLink}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-full h-14 text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : step === 'email' ? (
                'Send Invite'
              ) : (
                'Generate Link'
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
