# miniCRM — Implementation Status & TODO

Cross-referenced against `DESIGN.md` (Intelligence Interface vision) and the current codebase.
Last updated: 2026-03-21

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented and working |
| 🚧 | Partially implemented — structure exists, intelligence layer missing |
| ❌ | Not yet started — design exists, no code |
| 🔮 | Future phase — not scheduled yet |

---

## Layer 0 — Core CRM (Foundation)

| Feature | Status | Notes |
|---------|--------|-------|
| Contacts (list, detail, edit, delete) | ✅ | Full CRUD, tags, custom fields, linked deals/companies |
| Companies (list, detail, edit) | ✅ | Full CRUD, linked contacts/deals |
| Deals (list, kanban board, detail, drag-drop stage) | ✅ | @dnd-kit kanban, stage moves, value/probability |
| Activities (feed, create, complete, overdue highlight) | ✅ | Due date tracking, one-click complete |
| Notes (on contacts, companies, deals) | ✅ | Rich text, linked to entity |
| Pipeline Settings (stages, colors, won/lost, reorder) | ✅ | Full management UI |
| Multi-tenant (org-scoped RLS) | ✅ | All tables scoped by org_id via Supabase RLS |
| Auth (login, register, password reset, change password) | ✅ | Supabase Auth, profile page |
| MCP server (`/api/mcp`) | ✅ | 9 tools: list/get/create contacts, deals, activities, pipeline summary |
| API Keys (MCP Bearer tokens, scope control) | ✅ | Per-org key management |

---

## Layer 1 — Signal Fabric (Integrations)

| Feature | Status | Notes |
|---------|--------|-------|
| HubSpot import (contacts, companies, deals) | ✅ | Private app token, preview + import UI |
| Google Gmail — contact extraction from SENT mail | ✅ | OAuth, last 6 months |
| Google Calendar — bookings → activities | ✅ | OAuth, syncs as completed meetings |
| Mailchimp Group A (audience import, group tagging) | ✅ | OAuth, `mailchimp_a` provider, `mailchimp_group_a` tag |
| Mailchimp Group B (A/B test second audience) | ✅ | OAuth, `mailchimp_b` provider, `mailchimp_group_b` tag |
| Stripe — customers → contacts | ✅ | Secret key, dedup by email |
| Stripe — subscriptions → deals (MRR value) | ✅ | Interval normalization, stage mapping |
| Calendly — bookings → contacts + activities | ✅ | OAuth, dedup by event URI |
| Resend — send emails, auto-log as activities | ✅ | API key, linked to contact/deal |
| UI credential management (no .env required) | ✅ | Per-org DB storage, env fallback |
| **Signal semantic interpretation** | ❌ | Raw events stored but not interpreted. No sentiment, intent, or predictive weight. `Signal` interface from DESIGN.md not implemented. |
| **Webhook ingestion (real-time signals)** | ❌ | Currently import-only (pull). No push webhooks for Gmail/Stripe/Calendly live events. |
| **Signal deduplication + idempotency layer** | ❌ | Basic external_id dedup only. No full signal audit trail. |

---

## Layer 2 — Understanding Layer (ruvector)

**Status: ❌ Not started.** No embedding infrastructure exists.

| Feature | Status | Notes |
|---------|--------|-------|
| Contact embeddings | ❌ | No vector fields in schema |
| Deal signatures | ❌ | No vector fields in schema |
| Signal embeddings | ❌ | No vector fields in schema |
| ICP centroid (learned from best customers) | ❌ | No ruvector integration |
| ICP match scoring (cosine similarity) | ❌ | `icp_score` field does not exist on contacts |
| Semantic communication memory | ❌ | Emails stored but not embedded |
| Relationship graph (GNN layer) | ❌ | No graph edges, no second-degree relationships |
| "Similar to X" queries | ❌ | Requires vector similarity search |
| Won/lost cluster centroids | ❌ | Requires outcome-tagged embeddings |

**TODO:** Add `pgvector` (or ruvector) extension to Supabase. Add `embedding vector(1536)` columns to `contacts`, `deals`, `activities`. Build embedding pipeline triggered on contact/deal create/update.

---

## Layer 3 — Orchestration Layer (ruflo agents)

**Status: ❌ Not started.** No agent infrastructure exists.

| Agent | Status | Notes |
|-------|--------|-------|
| EmailInterpretAgent | ❌ | |
| PaymentSignalAgent | ❌ | |
| EngagementSignalAgent | ❌ | |
| MeetingSignalAgent | ❌ | |
| **DealHealthAgent** | ❌ | No `health_score` field on deals |
| ContactDecayAgent | ❌ | |
| ChurnRiskAgent | ❌ | |
| ICPMatchAgent | ❌ | |
| CloseProbabilityAgent | ❌ | |
| CloseTimingAgent | ❌ | |
| **NextBestActionAgent** (Q-learning) | ❌ | |
| OptimalCadenceAgent | ❌ | |
| DraftEmailAgent | ❌ | Manual Resend exists; AI drafting does not |
| BriefingAgent | ❌ | |
| AlertAgent | ❌ | |
| EnrichmentAgent | ❌ | |
| OutcomeRecorderAgent | ❌ | |
| WeightUpdaterAgent | ❌ | |
| PatternExtractorAgent | ❌ | |
| ruflo hook system (17 hooks) | ❌ | |

**TODO:** This is Phase 3 work. Prerequisite: Layer 2 (embeddings) must be complete first.

---

## Layer 4 — Intelligence Interface

### Screen 1: Focus Feed (/dashboard)

| Element | Status | Notes |
|---------|--------|-------|
| Summary bar (greeting, deal count) | 🚧 | Basic metrics exist (Total Contacts, Active Deals, Pipeline Value). No predicted revenue, no momentum %. |
| Intelligence cards (URGENT / FOLLOW UP / CLOSE SIGNAL / OUTREACH) | ❌ | Entire focus feed is design-only. Requires DealHealthAgent + AlertAgent. |
| Health score pills on cards | ❌ | No `health_score` in schema |
| Recommended action text (AI-generated) | ❌ | Requires NextBestActionAgent |
| Pattern evidence text ("similar to 3 of 4 deals…") | ❌ | Requires PatternExtractorAgent + ruvector |
| Signal source dots (Gmail, Calendly, etc.) | ❌ | Signals not interpreted/stored as typed events |
| Snooze / Dismiss card actions | ❌ | No snoozed_until or dismissed state on deals/contacts |
| Empty state (all resolved) | ❌ | |
| Momentum chip (↑14% vs last) | ❌ | No historical pipeline snapshot for comparison |

**TODO:** Add `health_score int`, `last_health_at timestamptz`, `snoozed_until timestamptz`, `dismissed_at timestamptz` to deals. Add `icp_score int` to contacts. Build a simple rule-based DealHealthAgent first (no ruflo required) using: days in stage, last activity date, email response rate.

### Screen 2: Momentum Board (/deals)

| Element | Status | Notes |
|---------|--------|-------|
| Kanban columns with drag-and-drop | ✅ | Fully working |
| Deal cards (name, value, stage) | ✅ | Basic deal card renders |
| Stage total ($ sum per column) | 🚧 | Not shown in current card — data is available, just needs UI |
| Deal count per column | 🚧 | Not shown — data available |
| **Health score bar** (4px gradient fill) | ❌ | No `health_score` field |
| **Momentum arrow** (↑↑ ↑ → ↓ ↓↓) | ❌ | No momentum calculation |
| **Stage velocity** (Xd in stage, ⚠ over avg) | ❌ | No `entered_stage_at` timestamp on deals |
| **Predicted close date** (~Apr 15) | ❌ | `expected_close` field exists but is manual. AI prediction not implemented. |
| Sort by health / filter | ❌ | |
| "+ Add deal" per column | ✅ | Exists on board |

**TODO (quick wins):** Add `entered_stage_at timestamptz` to deals, updated on every stage move. Show stage totals and deal counts in column headers. These require no AI — just schema + UI.

### Screen 3: Contact Intelligence Card (/contacts/[id])

| Element | Status | Notes |
|---------|--------|-------|
| Contact header (name, role, company, avatar) | ✅ | Full editable contact detail page |
| Contact metadata (email, phone, source, tags) | ✅ | All stored and editable |
| Linked deals (name, stage, value) | ✅ | Shown on contact detail page |
| Action buttons (email, note, schedule) | 🚧 | Notes and activities exist. Email compose via Resend exists. No "schedule" shortcut. |
| **ICP Match Score block** (94%, 3 dimensions) | ❌ | No `icp_score` field. Requires ruvector. |
| **Engagement Temperature** (Hot/Warm/Cooling) | ❌ | No engagement scoring |
| **Sparkline** (90-day interaction frequency) | ❌ | Activities exist but no time-series aggregation for sparkline |
| **AI Memory Block** (italic AI summary) | ❌ | Requires DraftEmailAgent / BriefingAgent |
| **Next Best Action block** | ❌ | Requires NextBestActionAgent |
| **Signal Timeline** (semantic feed) | ❌ | Activities exist but not semantically interpreted |
| Signal source filter pills | ❌ | |
| Sentiment pills (Positive/Neutral/Negative) | ❌ | No sentiment analysis |

**TODO (quick wins):** Add a basic activity timeline grouped by source (Gmail, Calendly, Manual) to the existing contact detail — this is a UI upgrade to what's already stored, no AI needed.

### Screen 4: Signal Timeline (component)

| Element | Status | Notes |
|---------|--------|-------|
| Basic activity list | ✅ | Activities table exists with type, subject, due_at |
| Source filter (All / Gmail / Calendly / etc.) | ❌ | No source-based filter on activities view |
| Semantic interpretation (italic AI sub-text) | ❌ | Requires embedding + interpretation agents |
| Sentiment pills | ❌ | |
| Timeline spine (connecting line + colored dots) | ❌ | Design only |

### Screen 5: Settings — Integrations

| Element | Status | Notes |
|---------|--------|-------|
| Integration cards (HubSpot, Google, Mailchimp A/B, Stripe, Calendly, Resend) | ✅ | Full UI with connect/disconnect, credential forms |
| Connected state (badge + signal count) | 🚧 | "Connected" badge works. Signal count not yet shown (no signal table). |
| Disconnected / error state | ✅ | Handled |
| Source color tokens on card accents | 🚧 | Functional but uses generic colors; should adopt `--signal-*` tokens from design brief |

---

## Phase Roadmap (from DESIGN.md)

| Phase | Scope | Prerequisite |
|-------|-------|-------------|
| **Phase 1 (NOW)** | Core CRM + all integrations as flat imports | ✅ Complete |
| **Phase 2 (NEXT)** | Schema additions: `health_score`, `entered_stage_at`, `icp_score`, `snoozed_until`. Rule-based health scoring (no AI). Basic signal timeline (activity list by source). | Phase 1 |
| **Phase 3** | ruvector embeddings: contact embeddings, deal signatures, ICP centroid. Basic semantic similarity. | Phase 2 |
| **Phase 4** | ruflo agents: DealHealthAgent, ICPMatchAgent, NextBestActionAgent. Focus Feed as live intelligence. | Phase 3 |
| **Phase 5** | Relationship Graph (force-directed). Natural language queries. Full Q-learning cadence optimization. | Phase 4 |

---

## Quick Wins (No AI Required)

These can be implemented immediately and visually complete the Momentum Board and Signal Timeline without the intelligence layer:

1. **`entered_stage_at` on deals** — add column, populate on stage move → enables "Xd in stage" velocity display
2. **Stage totals + deal count** in kanban column headers → trivial aggregate, data already exists
3. **Activity timeline grouped by source** on contact detail → filter existing activities by integration source
4. **`snoozed_until` + `dismissed_at` on deals** → enables snooze/dismiss on Focus Feed cards even before AI scoring
5. **Signal count on integration cards** → count activities by source per org

---

## Schema Changes Required (Phase 2)

```sql
-- deals table additions
ALTER TABLE deals
  ADD COLUMN health_score integer DEFAULT NULL CHECK (health_score BETWEEN 0 AND 100),
  ADD COLUMN health_direction text DEFAULT NULL CHECK (health_direction IN ('up_strong','up','neutral','down','down_strong')),
  ADD COLUMN entered_stage_at timestamptz DEFAULT now(),
  ADD COLUMN snoozed_until timestamptz DEFAULT NULL,
  ADD COLUMN dismissed_at timestamptz DEFAULT NULL;

-- contacts table additions
ALTER TABLE contacts
  ADD COLUMN icp_score integer DEFAULT NULL CHECK (icp_score BETWEEN 0 AND 100),
  ADD COLUMN engagement_temp text DEFAULT NULL CHECK (engagement_temp IN ('hot','warm','cooling','cold'));

-- signals table (new — Phase 2)
CREATE TABLE signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('gmail','calendly','stripe','mailchimp','manual','crm_event')),
  type text NOT NULL,
  raw_content text,
  sentiment_score numeric(3,2) DEFAULT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);
CREATE INDEX signals_org_contact ON signals(org_id, contact_id, occurred_at DESC);
CREATE INDEX signals_org_deal ON signals(org_id, deal_id, occurred_at DESC);
```

Migration number: `0008_intelligence_schema.sql`
