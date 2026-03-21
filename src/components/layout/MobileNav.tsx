'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, Building2, TrendingUp, CalendarCheck, Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/crm'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/contacts',   label: 'Contacts',   icon: Users },
  { href: '/companies',  label: 'Companies',  icon: Building2 },
  { href: '/deals',      label: 'Deals',      icon: TrendingUp },
  { href: '/activities', label: 'Activities', icon: CalendarCheck },
  { href: '/settings',   label: 'Settings',   icon: Settings },
]

interface MobileNavProps {
  profile: (Profile & { organizations: { name: string } | null }) | null
}

export function MobileNav({ profile }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-1.5 rounded-md hover:bg-accent transition-colors">
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar">
          <div className="flex items-center gap-2.5 h-14 px-4 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-sm">m</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">miniCRM</p>
              <p className="text-xs text-muted-foreground">{profile?.organizations?.name ?? 'Workspace'}</p>
            </div>
          </div>
          <nav className="px-2 py-3 space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
