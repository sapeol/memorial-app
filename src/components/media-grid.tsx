'use client'

import { useState } from 'react'
import { Image as ImageIcon, Edit, Trash2, Loader2, MoreVertical } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MediaItem {
  id: string
  url: string
  caption: string | null
  uploaded_by: string
}

interface MediaGridProps {
  mediaItems: MediaItem[]
  memorialId: string
  currentUserId: string
  isOwner: boolean
  canAdd: boolean
}

export function MediaGrid({ mediaItems, memorialId, currentUserId, isOwner, canAdd }: MediaGridProps) {
  const router = useRouter()
  const [items, setItems] = useState<MediaItem[]>(mediaItems)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    setDeleting(itemId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      setItems((prev) => prev.filter((m) => m.id !== itemId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo')
    } finally {
      setDeleting(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No photos added yet</p>
        {canAdd && (
          <Button
            onClick={() => router.push(`/memorials/${memorialId}/media/new`)}
            className="bg-brand text-brand-foreground hover:bg-brand-hover"
          >
            Add First Photo
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const canEdit = isOwner || item.uploaded_by === currentUserId

        return (
          <div key={item.id} className="group relative">
            <div
              className="aspect-square rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${item.url})` }}
            />

            {/* Actions overlay on hover */}
            {canEdit && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/memorials/${memorialId}/media/${item.id}/edit`)}
                  className="bg-background/90 hover:bg-background"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="bg-destructive/90 hover:bg-destructive"
                >
                  {deleting === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            )}

            {item.caption && (
              <p className="text-sm text-muted-foreground mt-2">{item.caption}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
