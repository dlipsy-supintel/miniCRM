import { Toaster } from '@/components/ui/sonner'
import { DemoSidebar } from '@/components/layout/DemoSidebar'
import { DemoBanner } from '@/components/layout/DemoBanner'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DemoSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DemoBanner />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
