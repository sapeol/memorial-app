'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Loader2, Check, X } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  status?: string | null
  onDelete?: () => void
  onStatusChange?: (newStatus: string) => void
}

export function MilestoneActions({
  milestoneId,
  memorialId,
  currentUserId,
  submittedById,
  canEdit,
  status,
  onDelete,
  onStatusChange,
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

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('milestones')
        .update({ status: newStatus })
        .eq('id', milestoneId)

      if (error) throw error
      onStatusChange?.(newStatus)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
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
        {canEdit && status === 'pending' && (
          <>
            <DropdownMenuItem
              onClick={() => handleStatusChange('approved')}
              className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange('rejected')}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
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
