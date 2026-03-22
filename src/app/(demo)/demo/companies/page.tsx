import { CompaniesTable } from '@/components/companies/CompaniesTable'
import { DEMO_COMPANIES } from '@/lib/demo-data'

export default function DemoCompaniesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <CompaniesTable initialData={DEMO_COMPANIES} />
    </div>
  )
}
