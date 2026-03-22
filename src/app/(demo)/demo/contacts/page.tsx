import { ContactsTable } from '@/components/contacts/ContactsTable'
import { DEMO_CONTACTS } from '@/lib/demo-data'

export default function DemoContactsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
      </div>
      <ContactsTable initialData={DEMO_CONTACTS} />
    </div>
  )
}
