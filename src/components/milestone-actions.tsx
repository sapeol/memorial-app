'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MilestoneActionsProps {
  milestoneId: string
  memorialId: string
  currentUserId: string
  submittedById: string
  canEdit: boolean
  onDelete?: () => void
}

export function MilestoneActions({
  milestoneId,
  memorialId,
  currentUserId,
  submittedById,
  canEdit,
  onDelete,
}: MilestoneActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isOwner = currentUserId === submittedById || canEdit

  if (!isOwner) return null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this milestone?')) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error
      onDelete?.()
    } catch (err: any) {
      alert(err.message || 'Failed to delete milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MoreVertical className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={() => router.push(`/memorials/${memorialId}/timeline/${milestoneId}/edit`)}
          className="text-foreground hover:bg-muted cursor-pointer"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
