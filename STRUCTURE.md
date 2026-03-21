# Project Structure

High-level map of every file and what it does. Use this to orient quickly without reading source code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router, TypeScript, Server Components |
| Database | Supabase (PostgreSQL + Row Level Security + Auth) |
| UI | Tailwind CSS v4 + `@base-ui/react` (shadcn base-nova style) |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Charts | Recharts |
| Forms/validation | Zod v4 |
| Auth sessions | `@supabase/ssr` (cookie-based) |
| MCP server | `@modelcontextprotocol/sdk` |
| Toasts | Sonner |
| Icons | Lucide React |

> **Note:** Uses `@base-ui/react` — NOT the standard `@radix-ui` shadcn. Components do not support `asChild`.

---

## Directory Tree

```
miniCRM/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Authenticated app shell (requires login)
│   │   │   ├── layout.tsx            # Sidebar + Header wrapper; redirects to /login if no session
│   │   │   ├── dashboard/page.tsx    # Metrics cards, pipeline bar chart, recent activities
│   │   │   ├── contacts/page.tsx     # Contacts list page (server, fetches first 50)
│   │   │   ├── companies/page.tsx    # Companies list page (server, fetches first 50)
│   │   │   ├── deals/page.tsx        # Deals Kanban page (server, fetches all stages + deals)
│   │   │   ├── activities/page.tsx   # Activities feed page (server, fetches first 50)
│   │   │   └── settings/
│   │   │       ├── page.tsx          # Redirects → /settings/integrations
│   │   │       ├── integrations/page.tsx  # Integration cards (Google, Mailchimp, Stripe, Calendly)
│   │   │       ├── profile/page.tsx       # Update display name (client)
│   │   │       └── users/page.tsx         # Team member list (server)
│   │   │
│   │   ├── (auth)/                   # Unauthenticated pages (no layout wrapper)
│   │   │   ├── login/page.tsx        # Login page
│   │   │   ├── register/page.tsx     # Register/create workspace page
│   │   │   └── auth/callback/route.ts  # Supabase OAuth code exchange
│   │   │
│   │   ├── api/
│   │   │   ├── auth/register/route.ts     # POST: create org + profile + default stages
│   │   │   ├── contacts/
│   │   │   │   ├── route.ts               # GET (list, search, paginate) + POST (create)
│   │   │   │   └── [id]/route.ts          # GET (detail+relations) + PATCH + DELETE
│   │   │   ├── companies/
│   │   │   │   ├── route.ts               # GET + POST
│   │   │   │   └── [id]/route.ts          # GET + PATCH + DELETE
│   │   │   ├── deals/
│   │   │   │   ├── route.ts               # GET + POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts           # GET + PATCH + DELETE
│   │   │   │       └── stage/route.ts     # PATCH: move deal to a new stage
│   │   │   ├── activities/
│   │   │   │   ├── route.ts               # GET (filterable by contact/deal/type/status) + POST
│   │   │   │   └── [id]/route.ts          # PATCH + DELETE
│   │   │   ├── notes/route.ts             # GET (filterable) + POST
│   │   │   ├── pipeline-stages/route.ts   # GET: all stages for current org (ordered)
│   │   │   ├── dashboard/metrics/route.ts # GET: calls get_dashboard_metrics() RPC
│   │   │   ├── integrations/
│   │   │   │   ├── [provider]/toggle/route.ts     # PATCH: enable/disable an integration
│   │   │   │   ├── google/
│   │   │   │   │   ├── connect/route.ts           # GET: redirect to Google OAuth
│   │   │   │   │   ├── callback/route.ts          # GET: exchange code, store tokens
│   │   │   │   │   └── gmail/sync/route.ts        # POST: incremental Gmail sync
│   │   │   │   ├── mailchimp/
│   │   │   │   │   ├── connect/route.ts           # GET: redirect to Mailchimp OAuth
│   │   │   │   │   ├── callback/route.ts          # GET: exchange code, store tokens
│   │   │   │   │   ├── sync/route.ts              # POST: import audience members as contacts
│   │   │   │   │   └── webhook/route.ts           # GET (verify) + POST (subscribe events)
│   │   │   │   ├── stripe/
│   │   │   │   │   ├── connect/route.ts           # POST: store user-provided secret key
│   │   │   │   │   ├── sync/route.ts              # POST: import Stripe customers as contacts
│   │   │   │   │   └── webhook/route.ts           # POST: handle customer/invoice events
│   │   │   │   └── calendly/
│   │   │   │       ├── connect/route.ts           # GET: redirect to Calendly OAuth
│   │   │   │       ├── callback/route.ts          # GET: exchange code, store tokens + user URI
│   │   │   │       ├── sync/route.ts              # POST: pull scheduled events + invitees
│   │   │   │       └── webhook/route.ts           # POST: invitee.created → contact + activity
│   │   │   └── mcp/route.ts                       # POST: MCP over HTTP (Bearer key auth)
│   │   │
│   │   ├── layout.tsx          # Root layout: Geist font, dark class, metadata
│   │   ├── page.tsx            # Root redirect (middleware handles this)
│   │   └── globals.css         # Tailwind v4 imports + CSS variables (dark theme, indigo accent)
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Email/password sign-in, calls supabase.auth.signInWithPassword
│   │   │   └── RegisterForm.tsx      # Workspace creation form, calls POST /api/auth/register
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Desktop nav (Dashboard/Contacts/Companies/Deals/Activities/Settings)
│   │   │   ├── Header.tsx            # User dropdown (Profile, Sign out)
│   │   │   └── MobileNav.tsx         # Hamburger sheet nav for mobile
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx        # Single KPI card (title, value, sub, icon, color)
│   │   │   ├── PipelineChart.tsx     # Recharts BarChart of deal value per stage
│   │   │   └── RecentActivities.tsx  # Last 6 activities with type icon + relative time
│   │   ├── contacts/
│   │   │   ├── ContactsTable.tsx     # Filterable table with client-side search + Add button
│   │   │   └── ContactDialog.tsx     # Create contact modal (name, email, phone, job title)
│   │   ├── companies/
│   │   │   ├── CompaniesTable.tsx    # Filterable table with client-side search + Add button
│   │   │   └── CompanyDialog.tsx     # Create company modal (name, domain, industry, website)
│   │   ├── deals/
│   │   │   ├── DealsKanban.tsx       # Top-level: DndContext wrapper, optimistic stage moves
│   │   │   ├── KanbanColumn.tsx      # Single stage column: useDroppable, deal list + value sum
│   │   │   ├── DealCard.tsx          # Draggable card: useSortable, title/value/contact/close date
│   │   │   └── DealDialog.tsx        # Create deal modal (title, value, stage, expected close)
│   │   ├── activities/
│   │   │   ├── ActivitiesView.tsx    # Activity feed with Done button + overdue/today highlighting
│   │   │   └── ActivityDialog.tsx    # Log activity modal (type, subject, due date)
│   │   ├── settings/
│   │   │   └── IntegrationsSettings.tsx  # Integration cards with connect/sync/toggle controls
│   │   └── ui/                       # shadcn base-nova components (@base-ui/react)
│   │       ├── button.tsx, input.tsx, label.tsx, card.tsx
│   │       ├── dialog.tsx, sheet.tsx, alert-dialog.tsx
│   │       ├── select.tsx, switch.tsx, tabs.tsx, textarea.tsx
│   │       ├── badge.tsx, avatar.tsx, skeleton.tsx, progress.tsx
│   │       ├── dropdown-menu.tsx, popover.tsx, command.tsx
│   │       ├── table.tsx, scroll-area.tsx, separator.tsx, tooltip.tsx
│   │       ├── sonner.tsx (toast provider), input-group.tsx
│   │       └── [all backed by @base-ui/react primitives]
│   │
│   ├── lib/
│   │   ├── api.ts                    # Shared route helpers: getAuthenticatedUser, ok, created, notFound, etc.
│   │   ├── utils.ts                  # cn() — Tailwind class merger
│   │   ├── supabase/
│   │   │   ├── client.ts             # createBrowserClient (for client components)
│   │   │   └── server.ts             # createServerClient + createServiceClient (for server/API routes)
│   │   ├── integrations/
│   │   │   ├── google.ts             # OAuth helpers, getAuthorizedClient, signState/verifyState
│   │   │   ├── mailchimp.ts          # getMailchimpClient, getMailchimpOAuthUrl
│   │   │   ├── stripe.ts             # getStripeClient, syncStripeContacts
│   │   │   └── calendly.ts           # getCalendlyOAuthUrl, exchangeCalendlyCode, getCalendlyClient
│   │   ├── mcp/
│   │   │   └── server.ts             # createMcpServer: registers all MCP tools (contacts/deals/activities)
│   │   └── validations/
│   │       ├── contact.ts            # createContactSchema / updateContactSchema (Zod v4)
│   │       ├── company.ts            # createCompanySchema / updateCompanySchema
│   │       ├── deal.ts               # createDealSchema / updateDealSchema / moveDealStageSchema
│   │       └── activity.ts           # createActivitySchema / updateActivitySchema
│   │
│   └── types/
│       └── crm.ts                    # All TypeScript interfaces: Organization, Profile, Contact,
│                                     # Company, Deal, PipelineStage, Activity, Note,
│                                     # IntegrationToken, SyncedEmail, McpApiKey, DashboardMetrics
│
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql   # All tables: organizations, profiles, contacts, companies,
│       │                             # pipeline_stages, deals, activities, notes,
│       │                             # integration_tokens, synced_emails, mcp_api_keys
│       ├── 0002_rls_policies.sql     # Row Level Security policies (all tables, org-scoped via JWT)
│       ├── 0003_functions.sql        # get_org_id(), custom_access_token_hook(), set_updated_at(),
│       │                             # get_dashboard_metrics() RPC
│       └── 0004_realtime.sql         # Enables realtime on deals, activities, notes, contacts
│
├── middleware.ts                     # Auth guard: redirects unauthenticated → /login;
│                                     # skips /api/integrations/.../webhook and /api/mcp
├── SETUP.md                          # Step-by-step setup from zero to running
├── NEXT_STEPS.md                     # Remaining integration configs + missing UI features
├── STRUCTURE.md                      # This file
├── README.md                         # Project overview and quick start
├── .env.example                      # All environment variable placeholders with comments
├── docs/deployment.md                # Full VPS + nginx + PM2 + certbot + cron guide
└── package.json                      # Node scripts use node_modules/next/dist/bin/next directly
```

---

## Data Model (Summary)

```
organizations   1──* profiles          (org_id → org, id → auth.users)
organizations   1──* contacts          (org_id → org)
organizations   1──* companies         (org_id → org)
organizations   1──* pipeline_stages   (org_id → org)
organizations   1──* deals             (org_id → org)
organizations   1──* activities        (org_id → org)
organizations   1──* notes             (org_id → org)
organizations   1──* integration_tokens (org_id → org)
organizations   1──* mcp_api_keys      (org_id → org)

contacts  *──1 companies   (company_id)
deals     *──1 pipeline_stages (stage_id)
deals     *──1 contacts    (contact_id)
deals     *──1 companies   (company_id)
activities *──1 contacts   (contact_id)
activities *──1 deals      (deal_id)
notes      *──1 contacts / deals / companies (nullable FKs)
synced_emails *──1 contacts (contact_id, nullable)
```

All tables have `org_id` and are protected by RLS policies that call `get_org_id()` — a function that reads `org_id` from the user's JWT claim (injected by `custom_access_token_hook`).

---

## API Response Format

All API routes return consistent JSON:

```json
// Success
{ "data": { ... }, "meta": { "total": 100, "page": 1, "per_page": 25, "total_pages": 4 } }

// Error
{ "error": { "code": "NOT_FOUND", "message": "Contact not found", "details": {} } }
```

HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error.

---

## MCP Tools Reference

The MCP server (`/api/mcp`) exposes these tools to AI agents:

| Tool | Scope required | Description |
|---|---|---|
| `list_contacts` | `read:contacts` | List/search contacts (name, email, tags) |
| `get_contact` | `read:contacts` | Full contact detail with deals + activities |
| `create_contact` | `write:contacts` | Create a new contact |
| `list_deals` | `read:deals` | List deals (filterable by stage/contact) |
| `get_deal` | `read:deals` | Full deal detail with activities + notes |
| `create_deal` | `write:deals` | Create a new deal |
| `move_deal_stage` | `write:deals` | Move a deal to a different pipeline stage |
| `list_activities` | `read:activities` | List activities (filterable by contact/deal/type/status) |
| `get_pipeline_summary` | `read:deals` | Dashboard metrics (counts, values, deals by stage) |
