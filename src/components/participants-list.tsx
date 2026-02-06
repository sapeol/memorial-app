'use client'

import { useState } from 'react'
import { Users, Mail, Shield, Trash2, Crown } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import Link from 'next/link'
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

/**
 * List of people who have access to the memorial.
 * Redesigned to use direct page links instead of modals for a cleaner experience.
 */
export function ParticipantsList({
  memorialId,
  ownerId,
  participants,
  currentUserId,
}: ParticipantsListProps) {
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
    owner: 'bg-primary/10 text-primary border-primary/20',
    contributor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    visitor: 'bg-muted text-muted-foreground border-border',
  }

  const accessLevelIcons = {
    owner: <Crown className="w-3.5 h-3.5" />,
    contributor: <Shield className="w-3.5 h-3.5" />,
    visitor: <Users className="w-3.5 h-3.5" />,
  }

  return (
    <Card className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="p-8 border-b border-border bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 tracking-tight">
              <Users className="w-7 h-7 text-primary" />
              Access Control
            </h2>
            <p className="text-muted-foreground font-medium mt-2">
              Manage who can honor and contribute to this memorial.
            </p>
          </div>
          <Link href={`/memorials/${memorialId}/invite`}>
            <Button
              className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12 font-bold shadow-sm cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-2" />
              Invite Someone
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Owner Row */}
        <div className="mb-10">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-1">
            Primary Caretaker
          </p>
          <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-bold text-lg leading-tight">You</p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1 opacity-60">
                  Owner
                </p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${accessLevelColors.owner}`}>
              <span className="flex items-center gap-2">
                {accessLevelIcons.owner}
                Owner
              </span>
            </span>
          </div>
        </div>

        {/* Participants List */}
        {participantsList.length > 0 ? (
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-1">
              Participants ({participantsList.length})
            </p>
            <div className="space-y-4">
              {participantsList.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-foreground font-bold text-lg leading-tight">
                        {participant.guest_name || participant.guest_email || 'Anonymous Member'}
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold mt-1">
                        {participant.accepted_at
                          ? `Joined ${new Date(participant.accepted_at).toLocaleDateString()}`
                          : `Invited ${participant.invited_at ? new Date(participant.invited_at).toLocaleDateString() : ''} • Pending`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Access Level Selector */}
                    {participant.accepted_at && participant.user_id && (
                      <div className="flex items-center">
                        <select
                          value={participant.access_level}
                          onChange={(e) => handleChangeAccess(participant.id, e.target.value as any)}
                          disabled={loading}
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border cursor-pointer outline-none transition-all ${accessLevelColors[participant.access_level]}`}
                        >
                          <option value="visitor">Visitor</option>
                          <option value="contributor">Contributor</option>
                        </select>
                      </div>
                    )}

                    {!participant.accepted_at && (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${accessLevelColors.visitor}`}>
                        Invited
                      </span>
                    )}

                    {/* Remove Action */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveParticipant(participant.id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-10 w-10 p-0 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/10 rounded-[32px] border border-dashed border-border">
            <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-muted-foreground font-bold mb-8">No other participants yet</p>
            <Link href={`/memorials/${memorialId}/invite`}>
              <Button
                variant="outline"
                className="border-border rounded-full px-8 h-12 font-bold cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2" />
                Invite Someone
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Access Level Guide */}
      <div className="p-8 border-t border-border bg-muted/50">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <p className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] mb-3">Contributor</p>
            <p className="text-xs leading-relaxed font-medium text-muted-foreground">Can share photos, milestones, and heartfelt stories on the timeline.</p>
          </div>
          <div className="flex-1">
            <p className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] mb-3">Visitor</p>
            <p className="text-xs leading-relaxed font-medium text-muted-foreground">Can view the memorial, light virtual candles, and sign the guestbook.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}