'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Building2, TrendingUp,
  CalendarCheck, Settings, Layers, Key, Plug, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/crm'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/contacts',    label: 'Contacts',    icon: Users },
  { href: '/companies',   label: 'Companies',   icon: Building2 },
  { href: '/deals',       label: 'Deals',       icon: TrendingUp },
  { href: '/activities',  label: 'Activities',  icon: CalendarCheck },
]

interface SidebarProps {
  profile: (Profile & { organizations: { name: string } | null }) | null
}

export function Sidebar({ profile }: SidebarProps) {
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
          <p className="text-xs text-muted-foreground truncate">
            {profile?.organizations?.name ?? 'Workspace'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
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

      {/* Settings */}
      <div className="px-2 pb-3 border-t border-sidebar-border pt-2 space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground px-2.5 pt-1 pb-0.5 uppercase tracking-wide">Settings</p>
        {[
          { href: '/settings/integrations', label: 'Integrations', icon: Plug },
          { href: '/settings/import', label: 'Import Data', icon: Upload },
          { href: '/settings/pipeline', label: 'Pipeline', icon: Layers },
          { href: '/settings/api-keys', label: 'API Keys', icon: Key },
          { href: '/settings/profile', label: 'Profile', icon: Settings },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
