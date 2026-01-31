'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ScrollLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * A client-side component that handles smooth scrolling to an anchor on the same page.
 * Provides a reliable fallback for normal navigation if the href is not a local anchor.
 */
export function ScrollLink({ href, children, className }: ScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only handle internal anchor links
    if (href.startsWith('#')) {
      const id = href.replace('#', '')
      const element = document.getElementById(id)
      
      if (element) {
        e.preventDefault()
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        
        // Update URL hash without causing a page jump/reload
        if (window.history.pushState) {
          window.history.pushState(null, '', href)
        } else {
          window.location.hash = href
        }
      }
    }
  }

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={cn('cursor-pointer', className)}
    >
      {children}
    </a>
  )
}