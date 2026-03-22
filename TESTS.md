# Tests

## Setup

Tests use **Jest** with **React Testing Library** and run in a jsdom environment via `next/jest`.

### Dependencies (devDependencies)

- `jest` — test runner
- `@testing-library/react` — React component rendering utilities
- `@testing-library/jest-dom` — custom DOM matchers (e.g. `toBeInTheDocument`)
- `jest-environment-jsdom` — browser-like test environment
- `@types/jest` — TypeScript definitions for Jest
- `identity-obj-proxy` — CSS module stub (used by next/jest)
- `ts-jest` — TypeScript transform for Jest

### Config files

- `jest.config.ts` — Jest configuration (uses `next/jest` for Next.js integration)
- `jest.setup.ts` — imports `@testing-library/jest-dom` matchers

## Running tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run a specific test file
npx jest src/__tests__/demo-pages/DemoDashboardPage.test.tsx
```

## Test suites

All demo page tests live in `src/__tests__/demo-pages/`.

### DemoActivitiesPage (`DemoActivitiesPage.test.tsx`)

- Renders the "Activities" page heading
- Renders `ActivitiesView` with all entries from `DEMO_ACTIVITIES`

### DemoCompaniesPage (`DemoCompaniesPage.test.tsx`)

- Renders the "Companies" page heading
- Renders `CompaniesTable` with all entries from `DEMO_COMPANIES`

### DemoContactsPage (`DemoContactsPage.test.tsx`)

- Renders the "Contacts" page heading
- Renders `ContactsTable` with all entries from `DEMO_CONTACTS`

### DemoDealsPage (`DemoDealsPage.test.tsx`)

- Renders the "Deals" page heading
- Renders `DealsKanban` with all entries from `DEMO_STAGES` and `DEMO_DEALS`

### DemoDashboardPage (`DemoDashboardPage.test.tsx`)

- Renders the "Dashboard" heading and greeting
- Renders four `DashboardMetricCard` components with values from `DEMO_METRICS` (Total Contacts, Active Deals, Pipeline Value, Due Today)
- Renders `PipelineChart` with `DEMO_METRICS.deals_by_stage`
- Renders `RecentActivities` with `DEMO_ACTIVITIES`

## Approach

Each test **mocks the child component** (e.g. `ActivitiesView`, `CompaniesTable`) with a lightweight stub that renders the props it receives. This isolates the page-level logic and verifies that:

1. The correct component is rendered
2. The correct demo data is passed through as props
3. Page-level UI (headings, layout) renders correctly

This avoids needing to mock deep dependencies like `recharts`, `@dnd-kit`, or `next/link`.
