'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Building2, TrendingUp, CalendarCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/demo',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/demo/contacts', label: 'Contacts',   icon: Users },
  { href: '/demo/companies',label: 'Companies',  icon: Building2 },
  { href: '/demo/deals',    label: 'Deals',      icon: TrendingUp },
  { href: '/demo/activities', label: 'Activities', icon: CalendarCheck },
]

export function DemoSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
          <span className="text-primary-foreground font-bold text-sm">m</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">miniCRM</p>
          <p className="text-xs text-muted-foreground truncate">Superior Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/demo' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/login"
          className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Exit demo & log in
        </Link>
      </div>
    </aside>
  )
}
