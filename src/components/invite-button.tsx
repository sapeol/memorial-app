'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from './ui/button'
import { InviteModal } from './invite-modal'

interface InviteButtonProps {
  memorialId: string
  memorialName: string
}

export function InviteButton({ memorialId, memorialName }: InviteButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="border-border"
      >
        <Mail className="w-4 h-4 mr-2" />
        Invite
      </Button>
      {showModal && (
        <InviteModal
          memorialId={memorialId}
          memorialName={memorialName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
