import { render, screen } from '@testing-library/react'
import DemoContactsPage from '@/app/(demo)/demo/contacts/page'
import { DEMO_CONTACTS } from '@/lib/demo-data'

jest.mock('@/components/contacts/ContactsTable', () => ({
  ContactsTable: ({ initialData }: { initialData: unknown[] }) => (
    <div data-testid="contacts-table" data-count={initialData.length}>
      {initialData.map((c: Record<string, string>) => (
        <span key={c.id}>{c.first_name} {c.last_name}</span>
      ))}
    </div>
  ),
}))

describe('DemoContactsPage', () => {
  it('renders the page heading', () => {
    render(<DemoContactsPage />)
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('renders ContactsTable with DEMO_CONTACTS', () => {
    render(<DemoContactsPage />)

    const table = screen.getByTestId('contacts-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('data-count', String(DEMO_CONTACTS.length))

    for (const contact of DEMO_CONTACTS) {
      expect(screen.getByText(`${contact.first_name} ${contact.last_name}`)).toBeInTheDocument()
    }
  })
})
