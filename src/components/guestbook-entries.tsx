'use client'

import { useState } from 'react'
import { MessageSquare, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GuestbookEntry {
  id: string
  message: string
  author_name: string
  author_id: string | null
  created_at: string | null
}

interface GuestbookEntriesProps {
  entries: GuestbookEntry[]
  memorialId: string
  currentUserId: string
  isOwner: boolean
}

export function GuestbookEntries({ entries, memorialId, currentUserId, isOwner }: GuestbookEntriesProps) {
  const [items, setItems] = useState<GuestbookEntry[]>(entries)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    setDeleting(itemId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      setItems((prev) => prev.filter((e) => e.id !== itemId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete message')
    } finally {
      setDeleting(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No messages yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((entry) => {
        const canEdit = isOwner || entry.author_id === currentUserId

        return (
          <div key={entry.id} className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-foreground">{entry.message}</p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-sm text-muted-foreground">
                    {entry.author_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {deleting === entry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MoreVertical className="w-4 h-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
