'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  PlusCircle,
  Heart
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/store/auth-store'
import { createClient } from '@/lib/supabase/client'

/**
 * A proper profile dropdown component for user navigation and management.
 * Provides quick access to dashboard, settings, and sign-out.
 */
export function ProfileDropdown() {
  const router = useRouter()
  const { user } = useAuthStore()
  const supabase = createClient()

  if (!user) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Get initials for avatar fallback
  const email = user.email || ''
  const initials = email.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none group">
          <Avatar className="h-9 w-9 border border-border group-hover:border-primary/50 transition-colors cursor-pointer">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 shadow-lg border-border bg-popover" align="end">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-foreground truncate">
              {user.user_metadata?.full_name || 'Account'}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate font-medium">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup className="p-1">
          <Link href="/dashboard">
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-secondary transition-colors">
              <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/memorials/new">
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-secondary transition-colors">
              <PlusCircle className="mr-3 h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">New Memorial</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-secondary transition-colors opacity-50 cursor-not-allowed">
            <User className="mr-3 h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-secondary transition-colors opacity-50 cursor-not-allowed">
            <Settings className="mr-3 h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Settings</span>
          </DropdownMenuItem>
        </MenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="p-1">
          <DropdownMenuItem 
            className="rounded-xl cursor-pointer py-2 px-3 focus:bg-destructive/10 focus:text-destructive transition-colors text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-bold text-sm">Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
