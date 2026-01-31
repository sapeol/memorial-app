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
      <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
        <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
        <p className="text-muted-foreground mb-8 font-medium">No photos added yet</p>
        {canAdd && (
          <Button
            onClick={() => router.push(`/memorials/${memorialId}/media/new`)}
            className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-12"
          >
            Add First Photo
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => {
        const canEdit = isOwner || item.uploaded_by === currentUserId

        return (
          <div key={item.id} className="group relative">
            <div
              className="aspect-square rounded-2xl bg-cover bg-center border border-border overflow-hidden"
              style={{ backgroundImage: `url(${item.url})` }}
            >
              {/* Actions overlay on hover */}
              {canEdit && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/memorials/${memorialId}/media/${item.id}/edit`)}
                    className="rounded-full px-4 h-9 border-border bg-background"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="rounded-full px-4 h-9"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {item.caption && (
              <p className="text-sm text-muted-foreground mt-3 font-medium leading-relaxed italic line-clamp-2 px-1">
                "{item.caption}"
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
