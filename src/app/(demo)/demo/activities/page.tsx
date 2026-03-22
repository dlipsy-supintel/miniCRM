import { ActivitiesView } from '@/components/activities/ActivitiesView'
import { DEMO_ACTIVITIES } from '@/lib/demo-data'

export default function DemoActivitiesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activities</h1>
      <ActivitiesView initialData={DEMO_ACTIVITIES} />
    </div>
  )
}
