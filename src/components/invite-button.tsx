'use client'

import { Mail } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

interface InviteButtonProps {
  memorialId: string
  memorialName: string
}

/**
 * Updated InviteButton to link directly to the invitation page.
 * Avoids showing a modal as per simplified UI requirements.
 */
export function InviteButton({ memorialId }: InviteButtonProps) {
  return (
    <Link href={`/memorials/${memorialId}/invite`}>
      <Button
        variant="outline"
        size="sm"
        className="border-border rounded-full px-6 font-bold cursor-pointer h-11"
      >
        <Mail className="w-4 h-4 mr-2" />
        Invite
      </Button>
    </Link>
  )
}