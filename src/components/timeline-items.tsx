'use client'

import { useState } from 'react'
import { MapPin, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { MilestoneActions } from './milestone-actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useRouter } from 'next/navigation'

interface Milestone {
  id: string
  title: string
  description: string | null
  event_date: string | null
  location: string | null
  submitted_by: string
  status: 'pending' | 'approved' | 'rejected' | null
}

interface TimelineItemsProps {
  milestones: Milestone[]
  memorialId: string
  currentUserId: string
  isOwner: boolean
}

export function TimelineItems({ milestones, memorialId, currentUserId, isOwner }: TimelineItemsProps) {
  const router = useRouter()
  const [items, setItems] = useState<Milestone[]>(milestones)

  const handleDelete = (deletedId: string) => {
    setItems((prev) => prev.filter((m) => m.id !== deletedId))
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setItems((prev) => prev.map((m) => 
      m.id === id ? { ...m, status: newStatus as any } : m
    ))
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground mb-6 font-medium">No milestones added yet</p>
        <Button
          onClick={() => router.push(`/memorials/${memorialId}/timeline/new`)}
          className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12"
        >
          Add First Milestone
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {items.map((milestone, index) => {
        const canEdit = isOwner || milestone.submitted_by === currentUserId
        const status = milestone.status || 'pending' // Default to pending if null

        return (
          <div key={milestone.id} className={`flex gap-6 group ${status === 'rejected' ? 'opacity-50' : ''}`}>
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-2 outline outline-4 outline-background ${
                status === 'approved' ? 'bg-primary' : 
                status === 'rejected' ? 'bg-destructive' : 'bg-yellow-500'
              }`} />
              {index < items.length - 1 && <div className="w-px flex-1 bg-border my-2" />}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
                      {milestone.event_date ? new Date(milestone.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </p>
                    {status === 'pending' && (
                      <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20">
                        Pending
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        Rejected
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-muted-foreground mt-2 leading-relaxed">{milestone.description}</p>
                  )}
                  {milestone.location && (
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-3">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {milestone.location}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <MilestoneActions
                    milestoneId={milestone.id}
                    memorialId={memorialId}
                    currentUserId={currentUserId}
                    submittedById={milestone.submitted_by}
                    canEdit={isOwner}
                    status={milestone.status}
                    onDelete={() => handleDelete(milestone.id)}
                    onStatusChange={(newStatus) => handleStatusChange(milestone.id, newStatus)}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
