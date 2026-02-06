'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ScrollLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * A client-side component that handles smooth scrolling to an anchor.
 * Uses a span with role="button" to avoid invalid nested HTML buttons.
 */
export function ScrollLink({ href, children, className }: ScrollLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.replace('#', '')
      const element = document.getElementById(id)
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        window.history.pushState(null, '', href)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const id = href.replace('#', '')
      const element = document.getElementById(id)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <span 
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn('cursor-pointer focus:outline-none', className)}
    >
      {children}
    </span>
  )
}