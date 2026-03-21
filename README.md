# miniCRM

A self-hosted CRM built on Next.js 15 and Supabase. Multi-tenant (org-scoped RLS), MCP server for AI agent access, and a full suite of integrations for contact data ingestion, outreach, and pipeline management.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router, TypeScript, Server Components, Turbopack |
| Database | Supabase (PostgreSQL + Row Level Security + Auth) |
| UI | Tailwind CSS v4 + `@base-ui/react` (shadcn base-nova) |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` (Kanban board) |
| Charts | Recharts |
| AI / MCP | `@modelcontextprotocol/sdk` — exposes CRM data to AI agents |

## Quick Start

```bash
npm install
# create .env.local with your Supabase keys (see SETUP.md)
npm run dev
```

Open [http://localhost:3000/register](http://localhost:3000/register) to create your workspace.

Full setup instructions: **[SETUP.md](./SETUP.md)**

## Features

### CRM Core
- **Contacts** — full detail pages, inline editing, notes, activity timeline, linked deals and companies
- **Companies** — company profiles with contacts, deals, notes
- **Deals** — Kanban board with drag-and-drop stage moves; deal detail with visual pipeline progress bar
- **Activities** — feed view with overdue/today highlighting and one-click completion

### Settings & Administration
- **Pipeline Settings** — add, rename, recolor, reorder pipeline stages; mark stages as Won/Lost
- **API Keys** — create MCP Bearer tokens for AI agent access with scope control
- **Integrations** — UI-based credential management; no `.env` changes needed

### Integrations

All OAuth credentials (Client ID/Secret) can be set in the UI under **Settings → Integrations** — stored encrypted per-org in the database, with `.env` fallback for self-hosted deployments.

| Integration | What it does |
|---|---|
| **HubSpot** | Import contacts, companies, and deals via Private App token |
| **Google Workspace** | Extract contacts from Gmail SENT history; sync calendar meetings as activities |
| **Mailchimp — Group A** | Import audience subscribers as contacts (A/B test group A) |
| **Mailchimp — Group B** | Import audience subscribers as contacts (A/B test group B) |
| **Stripe** | Sync customers → contacts, subscriptions → deals with monthly revenue value |
| **Calendly** | Sync booking invitees as contacts, bookings as completed meeting activities |
| **Resend** | Send emails from the CRM; auto-logged as email activities on contact/deal |

### Import Hub

**Settings → Import Data** provides a single page to:
- Connect HubSpot and run a preview before importing
- Pick a Mailchimp audience and sync subscribers
- Extract contacts from Gmail SENT history (last 6 months)

### MCP Server (AI Agent Access)

Generate an API key at **Settings → API Keys**, then add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "miniCRM": {
      "url": "https://your-domain.com/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_KEY" }
    }
  }
}
```

Available MCP tools: `list_contacts`, `get_contact`, `create_contact`, `list_deals`, `get_deal`, `create_deal`, `move_deal_stage`, `list_activities`, `get_pipeline_summary`

## Project Docs

| File | Contents |
|---|---|
| [SETUP.md](./SETUP.md) | Step-by-step setup: Supabase, migrations, env vars, VPS deploy |
| [NEXT_STEPS.md](./NEXT_STEPS.md) | Integration configs, remaining work, production checklist |
| [STRUCTURE.md](./STRUCTURE.md) | Full file tree, data model, API format, MCP tools |
| [DESIGN.md](./DESIGN.md) | Intelligence-first CRM design vision |

## Database Migrations

Run migrations in order in the Supabase SQL Editor:

```
supabase/migrations/0001_initial_schema.sql
supabase/migrations/0002_rls_policies.sql
supabase/migrations/0003_functions.sql
supabase/migrations/0004_realtime.sql
supabase/migrations/0005_hubspot_provider.sql
supabase/migrations/0006_integration_credentials.sql
supabase/migrations/0007_add_resend_provider.sql
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTEGRATION_STATE_SECRET=   # random 32-char string for OAuth state signing

# Optional — can also be set per-org in Settings → Integrations
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=
CALENDLY_CLIENT_ID=
CALENDLY_CLIENT_SECRET=

# Optional
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Build Notes

The `node_modules/.bin/next` binary is a broken copy (not a symlink) in this install. All npm scripts call Next.js directly:

```bash
npm run dev    # node node_modules/next/dist/bin/next dev --turbopack
npm run build  # node node_modules/next/dist/bin/next build --turbopack
npm run start  # node node_modules/next/dist/bin/next start
```
