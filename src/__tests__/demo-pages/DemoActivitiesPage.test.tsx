import { render, screen } from '@testing-library/react'
import DemoActivitiesPage from '@/app/(demo)/demo/activities/page'
import { DEMO_ACTIVITIES } from '@/lib/demo-data'

jest.mock('@/components/activities/ActivitiesView', () => ({
  ActivitiesView: ({ initialData }: { initialData: unknown[] }) => (
    <div data-testid="activities-view" data-count={initialData.length}>
      {initialData.map((a: Record<string, string>) => (
        <span key={a.id}>{a.subject}</span>
      ))}
    </div>
  ),
}))

describe('DemoActivitiesPage', () => {
  it('renders the page heading', () => {
    render(<DemoActivitiesPage />)
    expect(screen.getByText('Activities')).toBeInTheDocument()
  })

  it('renders ActivitiesView with DEMO_ACTIVITIES', () => {
    render(<DemoActivitiesPage />)

    const view = screen.getByTestId('activities-view')
    expect(view).toBeInTheDocument()
    expect(view).toHaveAttribute('data-count', String(DEMO_ACTIVITIES.length))

    for (const activity of DEMO_ACTIVITIES) {
      expect(screen.getByText(activity.subject)).toBeInTheDocument()
    }
  })
})
