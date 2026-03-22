'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MobileNav } from './MobileNav'
import type { Profile } from '@/types/crm'

interface HeaderProps {
  profile: (Profile & { organizations: { name: string } | null }) | null
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '??'

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border shrink-0">
      <MobileNav profile={profile} />
      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 h-8 px-2 rounded-md text-sm hover:bg-accent transition-colors">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm hidden sm:block">{profile?.full_name ?? 'User'}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => window.location.href = '/settings/profile'}>
            <User size={14} className="mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut size={14} className="mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  )
}
