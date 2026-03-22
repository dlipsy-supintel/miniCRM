import { DealsKanban } from '@/components/deals/DealsKanban'
import { DEMO_STAGES, DEMO_DEALS } from '@/lib/demo-data'

export default function DemoDealsPage() {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-semibold">Deals</h1>
      </div>
      <DealsKanban initialStages={DEMO_STAGES} initialDeals={DEMO_DEALS} />
    </div>
  )
}
