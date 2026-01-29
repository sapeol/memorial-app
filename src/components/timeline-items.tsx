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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No milestones added yet</p>
        <Button
          onClick={() => router.push(`/memorials/${memorialId}/timeline/new`)}
          className="bg-brand text-brand-foreground hover:bg-brand-hover"
        >
          Add First Milestone
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((milestone, index) => {
        const canEdit = isOwner || milestone.submitted_by === currentUserId

        return (
          <div key={milestone.id} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-brand" />
              {index < items.length - 1 && <div className="w-0.5 flex-1 bg-border min-h-16" />}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {milestone.event_date ? new Date(milestone.event_date).toLocaleDateString() : ''}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-muted-foreground mt-1">{milestone.description}</p>
                  )}
                  {milestone.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3" />
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
                    onDelete={() => handleDelete(milestone.id)}
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
