'use client'

import { useState } from 'react'
import { Users, Mail, Shield, Trash2, Crown } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { InviteModal } from './invite-modal'
import { createClient } from '@/lib/supabase/client'

interface Participant {
  id: string
  user_id: string | null
  guest_name: string | null
  guest_email: string | null
  access_level: 'owner' | 'contributor' | 'visitor'
  invited_at: string | null
  accepted_at: string | null
}

interface ParticipantsListProps {
  memorialId: string
  memorialName: string
  ownerId: string
  participants: Participant[]
  currentUserId: string
}

export function ParticipantsList({
  memorialId,
  memorialName,
  ownerId,
  participants,
  currentUserId,
}: ParticipantsListProps) {
  const [showInvite, setShowInvite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participantsList, setParticipantsList] = useState<Participant[]>(participants)

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memorial_participants')
        .delete()
        .eq('id', participantId)

      if (error) throw error

      setParticipantsList((prev) => prev.filter((p) => p.id !== participantId))
    } catch (err: any) {
      alert(err.message || 'Failed to remove participant')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAccess = async (participantId: string, newLevel: 'contributor' | 'visitor') => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memorial_participants')
        .update({ access_level: newLevel })
        .eq('id', participantId)

      if (error) throw error

      setParticipantsList((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, access_level: newLevel } : p))
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update access level')
    } finally {
      setLoading(false)
    }
  }

  const accessLevelColors = {
    owner: 'bg-brand/20 text-brand-foreground border-brand/30',
    contributor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    visitor: 'bg-muted/50 text-muted-foreground border-border',
  }

  const accessLevelIcons = {
    owner: <Crown className="w-3 h-3" />,
    contributor: <Shield className="w-3 h-3" />,
    visitor: <Users className="w-3 h-3" />,
  }

  return (
    <>
      <Card className="bg-card/50 backdrop-blur border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" />
                People with Access
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage who can view and contribute to this memorial
              </p>
            </div>
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-brand text-brand-foreground hover:bg-brand-hover"
            >
              <Mail className="w-4 h-4 mr-2" />
              Invite People
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Owner (always shown) */}
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Owner
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-brand-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">You (Owner)</p>
                  <p className="text-xs text-muted-foreground">
                    {ownerId === currentUserId ? 'This is your memorial' : 'Memorial owner'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${accessLevelColors.owner}`}>
                <span className="flex items-center gap-1">
                  {accessLevelIcons.owner}
                  Owner
                </span>
              </span>
            </div>
          </div>

          {/* Participants List */}
          {participantsList.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Participants ({participantsList.length})
              </p>
              <div className="space-y-2">
                {participantsList.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          {participant.guest_name || participant.guest_email || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {participant.accepted_at
                            ? `Joined ${new Date(participant.accepted_at).toLocaleDateString()}`
                            : `Invited ${participant.invited_at ? new Date(participant.invited_at).toLocaleDateString() : ''} • Pending`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Access Level Toggle */}
                      {participant.accepted_at && participant.user_id && (
                        <div className="flex items-center">
                          <select
                            value={participant.access_level}
                            onChange={(e) => handleChangeAccess(participant.id, e.target.value as any)}
                            disabled={loading}
                            className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${accessLevelColors[participant.access_level]}`}
                          >
                            <option value="visitor">Visitor</option>
                            <option value="contributor">Contributor</option>
                          </select>
                        </div>
                      )}

                      {!participant.accepted_at && (
                        <span className={`px-2 py-1 rounded-full text-xs border ${accessLevelColors.visitor}`}>
                          Pending
                        </span>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No other participants yet</p>
              <Button
                onClick={() => setShowInvite(true)}
                variant="outline"
                className="border-border"
              >
                <Mail className="w-4 h-4 mr-2" />
                Invite Someone
              </Button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Access Levels</p>
              <ul className="space-y-1 text-xs">
                <li><strong className="text-foreground">Owner:</strong> Full control, can invite others and manage participants</li>
                <li><strong className="text-foreground">Contributor:</strong> Can add photos, milestones, and guestbook entries</li>
                <li><strong className="text-foreground">Visitor:</strong> Can view the memorial and sign the guestbook</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {showInvite && (
        <InviteModal
          memorialId={memorialId}
          memorialName={memorialName}
          onClose={() => setShowInvite(false)}
          onInvited={() => setShowInvite(false)}
        />
      )}
    </>
  )
}
