import { render, screen } from '@testing-library/react'
import DemoCompaniesPage from '@/app/(demo)/demo/companies/page'
import { DEMO_COMPANIES } from '@/lib/demo-data'

jest.mock('@/components/companies/CompaniesTable', () => ({
  CompaniesTable: ({ initialData }: { initialData: unknown[] }) => (
    <div data-testid="companies-table" data-count={initialData.length}>
      {initialData.map((c: Record<string, string>) => (
        <span key={c.id}>{c.name}</span>
      ))}
    </div>
  ),
}))

describe('DemoCompaniesPage', () => {
  it('renders the page heading', () => {
    render(<DemoCompaniesPage />)
    expect(screen.getByText('Companies')).toBeInTheDocument()
  })

  it('renders CompaniesTable with DEMO_COMPANIES', () => {
    render(<DemoCompaniesPage />)

    const table = screen.getByTestId('companies-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('data-count', String(DEMO_COMPANIES.length))

    for (const company of DEMO_COMPANIES) {
      expect(screen.getByText(company.name)).toBeInTheDocument()
    }
  })
})
