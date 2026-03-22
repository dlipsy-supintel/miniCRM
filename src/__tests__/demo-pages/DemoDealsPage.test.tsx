import { render, screen } from '@testing-library/react'
import DemoDealsPage from '@/app/(demo)/demo/deals/page'
import { DEMO_STAGES, DEMO_DEALS } from '@/lib/demo-data'

jest.mock('@/components/deals/DealsKanban', () => ({
  DealsKanban: ({
    initialStages,
    initialDeals,
  }: {
    initialStages: unknown[]
    initialDeals: unknown[]
  }) => (
    <div
      data-testid="deals-kanban"
      data-stages={initialStages.length}
      data-deals={initialDeals.length}
    >
      {initialStages.map((s: Record<string, string>) => (
        <span key={s.id} data-testid={`stage-${s.id}`}>{s.name}</span>
      ))}
      {initialDeals.map((d: Record<string, string>) => (
        <span key={d.id} data-testid={`deal-${d.id}`}>{d.title}</span>
      ))}
    </div>
  ),
}))

describe('DemoDealsPage', () => {
  it('renders the page heading', () => {
    render(<DemoDealsPage />)
    expect(screen.getByText('Deals')).toBeInTheDocument()
  })

  it('renders DealsKanban with DEMO_STAGES and DEMO_DEALS', () => {
    render(<DemoDealsPage />)

    const kanban = screen.getByTestId('deals-kanban')
    expect(kanban).toBeInTheDocument()
    expect(kanban).toHaveAttribute('data-stages', String(DEMO_STAGES.length))
    expect(kanban).toHaveAttribute('data-deals', String(DEMO_DEALS.length))

    for (const stage of DEMO_STAGES) {
      expect(screen.getByTestId(`stage-${stage.id}`)).toHaveTextContent(stage.name)
    }

    for (const deal of DEMO_DEALS) {
      expect(screen.getByTestId(`deal-${deal.id}`)).toHaveTextContent(deal.title)
    }
  })
})
