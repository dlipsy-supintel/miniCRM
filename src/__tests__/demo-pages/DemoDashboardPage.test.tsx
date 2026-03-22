import { render, screen } from '@testing-library/react'
import DemoDashboardPage from '@/app/(demo)/demo/page'
import { DEMO_METRICS, DEMO_ACTIVITIES } from '@/lib/demo-data'

jest.mock('@/components/dashboard/MetricCard', () => ({
  DashboardMetricCard: ({ title, value, sub }: { title: string; value: string | number; sub: string }) => (
    <div data-testid={`metric-${title}`}>
      <span data-testid="metric-value">{value}</span>
      <span data-testid="metric-sub">{sub}</span>
    </div>
  ),
}))

jest.mock('@/components/dashboard/PipelineChart', () => ({
  PipelineChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="pipeline-chart" data-count={data.length}>
      {data.map((s: Record<string, string>) => (
        <span key={s.stage_id}>{s.name}</span>
      ))}
    </div>
  ),
}))

jest.mock('@/components/dashboard/RecentActivities', () => ({
  RecentActivities: ({ activities }: { activities: unknown[] }) => (
    <div data-testid="recent-activities" data-count={activities.length}>
      {activities.map((a: Record<string, string>) => (
        <span key={a.id}>{a.subject}</span>
      ))}
    </div>
  ),
}))

describe('DemoDashboardPage', () => {
  it('renders the page heading and subtitle', () => {
    render(<DemoDashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Good morning, Demo/)).toBeInTheDocument()
  })

  it('renders DashboardMetricCard for each metric with DEMO_METRICS values', () => {
    render(<DemoDashboardPage />)

    expect(screen.getByTestId('metric-Total Contacts')).toBeInTheDocument()
    expect(screen.getByTestId('metric-Active Deals')).toBeInTheDocument()
    expect(screen.getByTestId('metric-Pipeline Value')).toBeInTheDocument()
    expect(screen.getByTestId('metric-Due Today')).toBeInTheDocument()

    // Total Contacts card uses raw number
    const contactsCard = screen.getByTestId('metric-Total Contacts')
    expect(contactsCard).toHaveTextContent(String(DEMO_METRICS.total_contacts))

    // Active Deals card
    const dealsCard = screen.getByTestId('metric-Active Deals')
    expect(dealsCard).toHaveTextContent(String(DEMO_METRICS.total_deals))

    // Due Today card
    const dueCard = screen.getByTestId('metric-Due Today')
    expect(dueCard).toHaveTextContent(String(DEMO_METRICS.activities_due_today))
  })

  it('renders PipelineChart with DEMO_METRICS.deals_by_stage', () => {
    render(<DemoDashboardPage />)

    const chart = screen.getByTestId('pipeline-chart')
    expect(chart).toBeInTheDocument()
    expect(chart).toHaveAttribute('data-count', String(DEMO_METRICS.deals_by_stage.length))

    for (const stage of DEMO_METRICS.deals_by_stage) {
      expect(screen.getByText(stage.name)).toBeInTheDocument()
    }
  })

  it('renders RecentActivities with DEMO_ACTIVITIES', () => {
    render(<DemoDashboardPage />)

    const recent = screen.getByTestId('recent-activities')
    expect(recent).toBeInTheDocument()
    expect(recent).toHaveAttribute('data-count', String(DEMO_ACTIVITIES.length))

    for (const activity of DEMO_ACTIVITIES) {
      expect(screen.getByText(activity.subject)).toBeInTheDocument()
    }
  })
})
