'use client'

import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <FlaskConical size={14} />
        <span className="text-xs font-medium">
          Demo mode — no data is saved. Exploring the UX only.
        </span>
      </div>
      <Link
        href="/login"
        className="text-xs text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:opacity-80"
      >
        Exit demo →
      </Link>
    </div>
  )
}
