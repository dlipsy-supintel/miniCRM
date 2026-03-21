# miniCRM — Intelligence Design

> A living model of your business relationships, not a record-keeping system.

---

## The Core Problem With Every CRM That Exists Today

Every CRM — Salesforce, HubSpot, Pipedrive, Zoho — is architecturally the same thing: **a database that humans maintain**. The paradigm has not changed in 25 years.

- You log a call. You update a stage. You write a note.
- The system stores what you gave it.
- You query it back.
- You are the intelligence. The software is the filing cabinet.

The result: salespeople spend 30–40% of their working time on data entry instead of selling. Insights are retrospective. Predictions are manual ("I think this will close next quarter"). The system knows nothing that you didn't explicitly put into it.

**This design breaks that paradigm entirely.**

The premise: the CRM should observe everything, understand everything, and surface exactly what matters — automatically, continuously, and with increasing accuracy over time. The human's job is to make decisions and take action. Everything else is the machine's job.

---

## Vision: The Ambient Intelligence CRM

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SIGNAL FABRIC                                    │
│  Gmail · Calendly · Stripe · Mailchimp · Manual · Future sources    │
└────────────────────────┬────────────────────────────────────────────┘
                         │ every interaction is a signal
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   UNDERSTANDING LAYER (ruvector)                     │
│  Vector embeddings · Semantic similarity · Graph relationships       │
│  Contact memory · Deal signatures · Pattern recognition              │
└────────────────────────┬────────────────────────────────────────────┘
                         │ signals become meaning
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  ORCHESTRATION LAYER (ruflo)                         │
│  60+ specialized agents · Q-learning routing · SONA optimization    │
│  Deal health · Cadence optimization · Next-best-action               │
└────────────────────────┬────────────────────────────────────────────┘
                         │ meaning becomes action
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  INTELLIGENCE INTERFACE                               │
│  Focus Feed · Relationship Graph · Momentum Board · Signal Timeline  │
│  Natural language queries · Predictive cards · Daily briefing        │
└────────────────────────┬────────────────────────────────────────────┘
                         │ actions become outcomes
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SELF-LEARNING LOOPS                                 │
│  Outcomes update embeddings → Models improve → Routing sharpens     │
│  Predictions get more accurate with every deal closed               │
└─────────────────────────────────────────────────────────────────────┘
```

The loop is closed. The system gets smarter with every interaction, every outcome, every pattern it observes.

---

## Layer 1 — The Signal Fabric

### What Exists Today (shallow)
Integration events arrive as flat records: `contact_created`, `email_sent`, `invoice_paid`. The data is stored but the *meaning* is discarded.

### What It Should Be (deep)
Every event is a **signal** — a measurement with semantic content, temporal context, and predictive weight.

```typescript
interface Signal {
  id: string
  org_id: string
  contact_id: string | null
  deal_id: string | null
  source: 'gmail' | 'calendly' | 'stripe' | 'mailchimp' | 'manual' | 'crm_event'
  type: SignalType
  raw_content: string           // original text/data
  embedding_id: string          // ruvector ID for the embedded representation
  sentiment_score: number       // -1 to 1
  intent_signals: string[]      // ['pricing_interest', 'competitor_mention', 'urgency']
  predictive_weight: number     // learned from outcomes — how much does this signal matter?
  occurred_at: string
  metadata: Record<string, unknown>
}

type SignalType =
  | 'email_received' | 'email_sent' | 'email_opened' | 'email_clicked'
  | 'meeting_scheduled' | 'meeting_completed' | 'meeting_no_show'
  | 'payment_succeeded' | 'payment_failed' | 'subscription_cancelled'
  | 'list_subscribed' | 'list_unsubscribed' | 'campaign_opened'
  | 'pricing_page_viewed' | 'demo_requested' | 'contract_viewed'
  | 'stage_advanced' | 'stage_regressed' | 'activity_completed'
  | 'response_time_fast' | 'response_time_slow' | 'ghost'  // no response after N days
```

**Key insight: the `predictive_weight` field is learned, not set.** It starts at 0.5 for all signal types. Over time, as deals close or stall, the system updates how much each signal type actually predicted the outcome. A "pricing page viewed 3x in 24 hours" might learn a weight of 0.87 because it precedes closes 87% of the time. "Email opened" might learn 0.12 because it's weakly predictive.

### Signal Interpretation Pipeline

```
Raw event (webhook)
  → Signal extractor (parse fields, extract text)
  → Sentiment analyzer (ruflo SentimentAgent)
  → Intent classifier (ruflo IntentAgent)
  → Embedding generator (ruvector embed)
  → Signal stored + Contact embedding updated
  → Downstream agents notified
```

---

## Layer 2 — The Understanding Layer (ruvector)

### Architecture

ruvector's SONA (Self-Optimizing Neural Architecture) engine with PostgreSQL integration handles all vector operations directly inside the database layer. This means embeddings live alongside relational data — no external service, no sync lag, no separate vector store to maintain.

```
PostgreSQL (Supabase)
├── Standard tables (contacts, deals, etc.)     ← relational layer
└── ruvector extension                           ← intelligence layer
    ├── contact_embeddings                       (one per contact, continuously updated)
    ├── deal_signatures                          (one per deal, updated as deal progresses)
    ├── signal_embeddings                        (one per signal, immutable)
    ├── communication_embeddings                 (emails, notes, meeting summaries)
    ├── icp_profiles                             (Ideal Customer Profile centroids)
    └── outcome_patterns                         (won/lost cluster centroids)
```

### What Gets Embedded and Why

#### Contact Embeddings
Each contact has a single vector that represents everything known about them — updated on every new signal.

```sql
-- Built from concatenation of:
-- 1. Company/role context ("VP Engineering at Series B SaaS company")
-- 2. All email subjects and snippets (semantic topics discussed)
-- 3. Activity history ("3 demos, 1 pricing call, 2 technical reviews")
-- 4. Behavioral signals ("responds quickly on Tuesdays, radio silence on Fridays")
-- 5. Deal history ("previously evaluated us in 2023, cited integration concerns")

SELECT ruvector.embed(
  contact_id,
  jsonb_build_object(
    'profile', contact_profile_text,
    'communications', array_agg(signal_text),
    'behaviors', behavior_summary,
    'history', deal_history_text
  )
) INTO contact_embeddings;
```

**What this enables:**
- "Find me contacts similar to my top 5 customers" → semantic nearest-neighbor search
- "Who in my CRM has expressed interest in our new feature before we announced it?" → search communications embeddings
- "Which contacts are showing the same pre-churn patterns we've seen before?" → compare against churned contact cluster

#### Deal Signatures
Each deal accumulates a vector representation of its journey so far.

```sql
-- Built from:
-- 1. Size/segment/industry context
-- 2. Stage progression timeline
-- 3. Signals received during deal
-- 4. Communication content
-- 5. Champion engagement level
-- 6. Objections surfaced

-- On close (won or lost), the final signature is tagged with outcome
-- This builds the "won deal cluster" and "lost deal cluster" in vector space
```

**What this enables:**
- New deals can be compared against the won/lost clusters
- "This deal looks 78% similar to 6 deals we lost — they all stalled at Proposal stage with technical evaluation concerns"
- Deal probability is no longer a manually set number — it's the distance ratio between the deal signature and each cluster

#### Semantic Communication Memory
Every email, note, and meeting summary is embedded independently.

**What this enables:**
- Natural language recall: "When did we discuss their compliance requirements?"
- Topic clustering: automatically tag contacts with topics they've engaged on
- Pattern extraction: "What do all deals mention in the week before close?"

### ICP (Ideal Customer Profile) Intelligence

Current CRMs: you manually define ICP criteria as a checklist (company size 50–500, industry = SaaS, title includes "VP").

This design: ICP is a learned vector centroid.

```
Step 1: Select your 10 best customers (by LTV, retention, NPS, or manual tag)
Step 2: ruvector computes the centroid of their contact embeddings
Step 3: ICP score = cosine similarity to centroid
Step 4: Every new contact gets an ICP score automatically
Step 5: As new customers are added, centroid updates automatically
```

The ICP doesn't need to be described — it's inferred from reality. "Your best customers cluster around this point in semantic space. New contacts at this distance are high probability."

### Relationship Graph Intelligence

ruvector's GNN (Graph Neural Network) layer enables relationship modeling beyond direct contacts:

```
Contacts
  └── knows → Contacts (mutual meetings, CC'd emails, shared events)
  └── works_at → Companies
  └── previously_at → Companies (career history from signals)

Companies
  └── partner_of → Companies
  └── competitor_of → Companies
  └── vendor_of → Companies (inferred from Stripe/invoices)
```

**Use cases:**
- "Who in my network knows someone at Acme Corp?" (warm introduction paths)
- Second-degree prospect discovery: contacts of contacts who match ICP
- Competitive relationship mapping: "How many of our contacts are also connected to [competitor]?"

---

## Layer 3 — The Orchestration Layer (ruflo)

ruflo runs as a sidecar to the Next.js application — a persistent multi-agent system that processes the signal stream and outputs prioritized actions.

### Agent Architecture

```
ruflo Agent Swarm
├── Signal Processing Agents
│   ├── EmailInterpretAgent      — extracts intent, sentiment, topics from Gmail signals
│   ├── PaymentSignalAgent       — interprets Stripe events (expansion, churn risk, LTV change)
│   ├── EngagementSignalAgent    — scores Mailchimp opens/clicks against historical patterns
│   └── MeetingSignalAgent       — processes Calendly events, updates meeting history
│
├── Intelligence Agents
│   ├── DealHealthAgent          — continuously scores deal health [0–100], flags drops >15pts
│   ├── ContactDecayAgent        — tracks engagement decay, surfaces "at risk of going cold"
│   ├── ChurnRiskAgent           — monitors Stripe customers for pre-churn behavioral patterns
│   └── ICPMatchAgent            — scores new contacts against ICP centroid in ruvector
│
├── Prediction Agents
│   ├── CloseProbabilityAgent    — computes deal close probability from ruvector signature distance
│   ├── CloseTimingAgent         — predicts close date from velocity compared to similar deals
│   ├── NextBestActionAgent      — Q-learning agent: what action maximizes close probability?
│   └── OptimalCadenceAgent      — learns best time/channel/frequency per contact segment
│
├── Action Agents
│   ├── DraftEmailAgent          — generates contextual email drafts using communication memory
│   ├── BriefingAgent            — produces daily intelligence briefing per user
│   ├── AlertAgent               — routes urgent signals to appropriate human with context
│   └── EnrichmentAgent          — auto-enriches new contacts from all connected sources
│
└── Learning Agents
    ├── OutcomeRecorderAgent     — when deals close, records outcome against all prior signals
    ├── WeightUpdaterAgent       — updates signal predictive_weight based on outcome correlation
    ├── PatternExtractorAgent    — extracts reusable patterns from closed deals
    └── ModelCalibrationAgent   — recalibrates prediction models quarterly
```

### Q-Learning in Next Best Action

The `NextBestActionAgent` uses ruflo's built-in Q-learning to learn which actions, taken in which context, lead to positive outcomes.

```
State: (deal_stage, deal_health, days_since_last_contact, contact_role, deal_value_tier)
Actions: {send_email, schedule_call, send_case_study, request_demo, propose_next_step, do_nothing}
Reward: deal_stage_advance (+10), deal_close (+100), no_response_3_days (-5), deal_lost (-50)

Q(state, action) updates after every action → outcome pair
Over time: the agent learns that "send_case_study when health=60 and days_stale=5 for technical_evaluator"
has Q=7.3, while "schedule_call" has Q=3.1 in the same state
```

This is fundamentally different from rule-based "if X then Y" automation. The system discovers the rules from evidence.

### The ruflo Hook System

17 context-triggered hooks map CRM events to agent dispatches:

```typescript
// hooks/crm.hooks.ts

const hooks: RufloHook[] = [
  {
    trigger: 'deal.health_drop',
    condition: (e) => e.previous_health - e.current_health > 15,
    agents: ['AlertAgent', 'NextBestActionAgent'],
    priority: 'urgent',
  },
  {
    trigger: 'signal.received',
    condition: (e) => e.source === 'gmail' && e.type === 'email_received',
    agents: ['EmailInterpretAgent', 'ContactDecayAgent'],
    priority: 'normal',
  },
  {
    trigger: 'stripe.customer.subscription_cancelled',
    agents: ['ChurnRiskAgent', 'AlertAgent'],
    priority: 'urgent',
  },
  {
    trigger: 'contact.created',
    agents: ['EnrichmentAgent', 'ICPMatchAgent'],
    priority: 'background',
  },
  {
    trigger: 'deal.closed_won',
    agents: ['OutcomeRecorderAgent', 'WeightUpdaterAgent', 'PatternExtractorAgent'],
    priority: 'background',
  },
  {
    trigger: 'schedule.daily_0800',
    agents: ['BriefingAgent', 'OptimalCadenceAgent'],
    priority: 'normal',
  },
]
```

---

## Layer 4 — The Intelligence Interface

The UI must be rebuilt around intelligence, not data entry. Current CRM screens are forms. These screens are answers.

### View 1: The Focus Feed (replaces Dashboard)

Not "here are your metrics." Instead: **"here is what you should do today, and why."**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Good morning. 3 deals need your attention. 2 contacts are ready.       │
│  Your pipeline has $284k predicted to close this month (↑12% vs last). │
├─────────────────────────────────────────────────────────────────────────┤
│ URGENT                                                                   │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ⚠  Acme Corp deal cooling — health dropped 24pts in 48 hours    │   │
│ │    Last signal: Sarah Chen opened pricing page Mon, no reply     │   │
│ │    Similar pattern: 3 of 4 similar deals that stalled here lost  │   │
│ │    Recommended: Send technical ROI case study today              │   │
│ │    [Draft email]  [Schedule call]  [Snooze 2d]  [Dismiss]        │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ 🟢  TechFlow Inc showing strong close signals                    │   │
│ │    3 pricing page visits · Champion responded <2hr · 89% match  │   │
│ │    to your last 5 wins · Predicted close: within 12 days        │   │
│ │    Recommended: Propose contract this week                       │   │
│ │    [Draft proposal]  [Schedule closing call]  [View deal]        │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ READY FOR OUTREACH                                                       │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ ○  Marcus Webb — last engaged 18 days ago                        │   │
│ │    Profile: 91% ICP match · Role: VP Engineering · Warm signal  │   │
│ │    last week: his company raised Series B (Stripe signal)        │   │
│ │    Best time to reach: Tuesday 9–11am (learned from history)    │   │
│ │    [Draft outreach]  [View contact]  [Not now]                   │   │
│ └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key design principles:**
- Every card has a specific recommended action (not "review this deal")
- Every recommendation shows its evidence ("similar pattern: 3 of 4 deals…")
- Every card shows predicted impact
- Actions are one-click, not "go to the deal and figure out what to do"
- Cards disappear when resolved (taken action, or explicitly dismissed with reason logged)

### View 2: Relationship Graph (replaces Contact List)

A force-directed graph where:
- **Nodes** are contacts and companies
- **Edge weight** = relationship strength (frequency + recency of interactions)
- **Node temperature** = engagement momentum (color: blue=cooling, green=warm, orange=hot)
- **Node size** = deal value associated or ICP score
- **Clusters** emerge naturally around companies, industries, deal stages

```
Controls:
  [Filter by: Stage] [Filter by: Temperature] [Filter by: ICP score > 80]
  [Show: 2nd degree connections] [Show: Introduction paths to Acme Corp]
  [Highlight: Churned customers] [Highlight: Similar to selected contact]
```

Clicking a node expands it into a **Contact Intelligence Card** showing:
- ICP match score and the 3 dimensions driving it
- Engagement trajectory (chart of interaction frequency over 90 days)
- Signal timeline (all signals from all sources, interpreted)
- Memory summary (AI-generated: "Sarah is a technical buyer focused on security and integration complexity. Responds best to async communication. Last interaction had positive sentiment.")
- Predicted next engagement (when is she likely to re-engage based on her patterns?)

### View 3: Momentum Board (replaces Kanban)

The Kanban paradigm survives but every card carries intelligence:

```
┌─── LEAD ────────────┐ ┌─── QUALIFIED ───────┐ ┌─── PROPOSAL ────────┐
│                     │ │                     │ │                     │
│ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │
│ │ Acme Corp       │ │ │ │ TechFlow Inc    │ │ │ │ DevShop LLC     │ │
│ │ $45k            │ │ │ │ $120k      ↑↑  │ │ │ │ $28k       ↓   │ │
│ │ Health: 71  →   │ │ │ │ Health: 89  ↑  │ │ │ │ Health: 42  ↓  │ │
│ │ 4d in stage     │ │ │ │ 2d in stage    │ │ │ │ 19d ⚠ avg 8d   │ │
│ │ Close: ~Mar 28  │ │ │ │ Close: ~Mar 15 │ │ │ │ Close: unclear │ │
│ └─────────────────┘ │ │ └─────────────────┘ │ │ └─────────────────┘ │
│                     │ │                     │ │                     │
```

**The arrow indicators (↑↑ ↑ → ↓ ↓↓)** are momentum scores — not stage changes, but trajectory within a stage based on recent signal activity. A deal in "Proposal" for 19 days when the average is 8 days is visually flagged.

**Predicted close date** comes from ruvector: comparing this deal's current signature against the velocity profiles of similar closed deals.

**Health score (0–100)** from ruflo's DealHealthAgent, computed from:
- Recency of contact with champion (decays over time)
- Sentiment trajectory of recent communications
- Engagement level vs. expected for this stage
- Distance from "won deal" cluster vs. "lost deal" cluster in ruvector
- Presence/absence of key signals for this stage (e.g., "technical review completed")

### View 4: The Signal Timeline (new concept entirely)

For any contact, deal, or company: a unified, interpreted timeline of all signals from all sources.

```
Contact: Sarah Chen — VP Engineering, Acme Corp

Mar 20  ●  Gmail       "Re: Integration architecture" — Positive sentiment, technical depth
         │             Topics: security, SSO, API rate limits · Response time: 3h (fast for her)
         │             AI: "Sarah is engaging deeply on technical requirements — buying committee expanding"

Mar 18  ●  Calendly    Meeting completed: "Product deep-dive" (62 min, scheduled 45)
         │             AI: "Meeting ran long. Champion is investing time. Strong engagement signal."

Mar 15  ●  Mailchimp   Opened "Security whitepaper" campaign · Clicked through · Read time: 4m
         │             AI: "Security whitepaper read — aligns with her stated concerns from Mar 12 email"

Mar 12  ●  Gmail       "Concerns about our data handling" — Slightly negative sentiment
         │             Topics: compliance, SOC2, data residency
         │             AI: "Compliance concern raised. Unaddressed objection. Recommend sending SOC2 docs."

Mar 10  ●  Stripe      (Parent company) Renewed annual subscription · MRR +$2,400
         │             AI: "Related account renewed. Positive signal for expansion conversation."

Mar 8   ●  CRM         Stage advanced: Lead → Qualified
```

Every signal shows:
1. The raw data (what happened)
2. The interpreted meaning (what it means)
3. The action implication (what to do about it)

### View 5: Natural Language Intelligence Query

Powered by ruvector's semantic search + ruflo's BriefingAgent:

```
Ask your CRM anything:

> "Which deals are most at risk of slipping this quarter?"
→ Shows 4 deals ranked by risk score, each with the 3 signals driving the risk

> "Find contacts similar to my best customer, Apex Inc"
→ Semantic similarity search against contact embeddings, returns top 8 matches with match %

> "What do all our won deals have in common at the proposal stage?"
→ Pattern extraction from won deal cluster — returns top 5 distinguishing signals

> "When did we last discuss pricing with TechFlow?"
→ Semantic search through communication_embeddings, returns exact email snippet + date

> "Who hasn't heard from us in 30 days but showed buying intent recently?"
→ Compound query: engagement_decay + intent_signal filter

> "What's our average time-to-close for enterprise deals that came from Calendly?"
→ Attribution analysis combining Calendly source signals with deal outcome data
```

---

## The Self-Learning Loops

Three closed feedback loops that make the system smarter over time:

### Loop A: Deal Pattern Learning

```
              ┌──────────────────────────────────┐
              │         CLOSED DEALS              │
              │  (Won: 47  ·  Lost: 31)           │
              └──────────────┬───────────────────┘
                             │
              ruvector clusters by outcome
                             │
              ┌──────────────▼───────────────────┐
              │       PATTERN CENTROIDS           │
              │  Won centroid: [0.2, 0.7, -0.1…] │
              │  Lost centroid: [0.8, 0.1, 0.4…] │
              └──────────────┬───────────────────┘
                             │
              New deal signatures continuously compared
                             │
              ┌──────────────▼───────────────────┐
              │      PREDICTED PROBABILITY        │
              │  dist(deal, won_centroid) /       │
              │  (dist(won) + dist(lost))          │
              └──────────────┬───────────────────┘
                             │
              Deal closes → outcome recorded
                             │
              ┌──────────────▼───────────────────┐
              │      CENTROIDS UPDATED            │
              │  More data → better clusters      │
              │  Probability improves over time   │
              └──────────────────────────────────┘
```

**Key property: the first prediction is a guess. The hundredth prediction is an insight.**

### Loop B: Signal Weight Learning

```
Signal type "pricing_page_viewed_3x" observed in deal
              ↓
Deal closes (won or lost)
              ↓
WeightUpdaterAgent records: signal_type → outcome
              ↓
After N observations:
  pricing_page_viewed_3x → won: 82% of the time
  email_opened           → won: 53% of the time (near random, low weight)
  meeting_no_show        → won: 11% of the time (strong negative signal)
              ↓
signal.predictive_weight updated in DB
              ↓
Health scores and focus feed re-weighted automatically
```

### Loop C: Action Effectiveness Learning

```
Next Best Action recommended: "Send case study"
              ↓
Human takes action (or skips — skip is also recorded)
              ↓
N days later: deal advanced? → reward +10
              deal stalled? → reward -3
              deal closed won? → reward +100
              deal closed lost? → reward -50
              ↓
Q-learning table updated:
  Q(state="proposal,health=60,days_stale=5", action="send_case_study") += reward
              ↓
Over hundreds of deal-actions:
  System learns: at health=60 in Proposal, case study → advance 71% of the time
  vs. scheduling a call → advance 43% of the time
              ↓
Recommendation confidence increases, advice becomes more specific:
  "Based on 47 similar situations, sending the case study first
   then scheduling a call 3 days later has an 81% advance rate"
```

---

## Database Schema Extensions

These tables extend the existing miniCRM schema to support the intelligence layer:

```sql
-- Signals table — interpretable events from all sources
CREATE TABLE signals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id       UUID REFERENCES contacts(id),
  deal_id          UUID REFERENCES deals(id),
  company_id       UUID REFERENCES companies(id),
  source           TEXT NOT NULL,
  type             TEXT NOT NULL,
  raw_content      TEXT,
  embedding_id     TEXT,                        -- ruvector embedding reference
  sentiment_score  FLOAT,                       -- -1 to 1
  intent_signals   TEXT[],
  predictive_weight FLOAT DEFAULT 0.5,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata         JSONB DEFAULT '{}'
);

-- Contact embeddings — one per contact, continuously updated
CREATE TABLE contact_embeddings (
  contact_id       UUID PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  embedding        VECTOR(1536),                -- ruvector compatible
  icp_score        FLOAT,                       -- cosine sim to ICP centroid
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT now(),
  signal_count     INTEGER DEFAULT 0,
  metadata         JSONB DEFAULT '{}'
);

-- Deal signatures — one per deal, updated as deal progresses
CREATE TABLE deal_signatures (
  deal_id          UUID PRIMARY KEY REFERENCES deals(id) ON DELETE CASCADE,
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  embedding        VECTOR(1536),
  health_score     FLOAT DEFAULT 50,
  momentum         FLOAT DEFAULT 0,            -- positive = accelerating, negative = decelerating
  predicted_close  TIMESTAMPTZ,
  close_probability FLOAT,                     -- computed by ruvector similarity
  outcome          TEXT,                        -- NULL while open, 'won'/'lost' on close
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communication embeddings — every email/note indexed semantically
CREATE TABLE communication_embeddings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type      TEXT NOT NULL,              -- 'email', 'note', 'meeting_summary'
  source_id        TEXT NOT NULL,              -- external ID or note ID
  contact_id       UUID REFERENCES contacts(id),
  deal_id          UUID REFERENCES deals(id),
  content_text     TEXT,
  embedding        VECTOR(1536),
  topics           TEXT[],
  sentiment_score  FLOAT,
  occurred_at      TIMESTAMPTZ NOT NULL
);

-- Intelligence cards — the Focus Feed items
CREATE TABLE intelligence_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to      UUID REFERENCES profiles(id),
  type             TEXT NOT NULL,              -- 'deal_at_risk', 'contact_ready', 'close_signal', etc.
  priority         TEXT NOT NULL DEFAULT 'normal',
  title            TEXT NOT NULL,
  description      TEXT,
  evidence         JSONB,                      -- the signals + patterns that triggered this
  recommended_action TEXT,
  recommended_payload JSONB,                   -- pre-filled data for the action
  predicted_impact TEXT,
  confidence       FLOAT,
  status           TEXT DEFAULT 'open',        -- 'open', 'actioned', 'dismissed', 'snoozed'
  action_taken     TEXT,
  outcome          TEXT,                       -- filled in after N days
  contact_id       UUID REFERENCES contacts(id),
  deal_id          UUID REFERENCES deals(id),
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Q-learning state-action table for Next Best Action
CREATE TABLE action_rewards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state_hash       TEXT NOT NULL,              -- hash of (stage, health_tier, days_stale_tier, contact_role)
  action           TEXT NOT NULL,
  q_value          FLOAT NOT NULL DEFAULT 0,
  sample_count     INTEGER DEFAULT 0,
  last_updated     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, state_hash, action)
);

-- ICP profiles — Ideal Customer Profile centroids
CREATE TABLE icp_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL DEFAULT 'default',
  centroid         VECTOR(1536),
  sample_contact_ids UUID[],                   -- the contacts used to build this ICP
  contact_count    INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## ruvector Integration — Implementation

### Installation alongside Supabase

```bash
# Add ruvector as a Supabase extension (self-hosted or via custom migration)
# ruvector provides pgvector compatibility — drop-in replacement

# In supabase/migrations/0005_ruvector.sql:
CREATE EXTENSION IF NOT EXISTS ruvector;  -- or pgvector as fallback for hosted Supabase

-- Enable HNSW indexing for fast approximate nearest neighbor search
CREATE INDEX contact_embeddings_hnsw ON contact_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX communication_embeddings_hnsw ON communication_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### Embedding Generation (src/lib/intelligence/embeddings.ts)

```typescript
import { createClient } from '@/lib/supabase/server'

const EMBEDDING_MODEL = 'text-embedding-3-small'  // or local model via ruvector

export async function embedText(text: string): Promise<number[]> {
  // Option A: OpenAI embeddings (cloud)
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: EMBEDDING_MODEL }),
  })
  const { data } = await res.json()
  return data[0].embedding

  // Option B: ruvector local embedding (zero API cost, runs on your VPS)
  // const res = await fetch('http://localhost:7700/embed', {
  //   method: 'POST',
  //   body: JSON.stringify({ text, model: 'nomic-embed-text' }),
  // })
  // return (await res.json()).embedding
}

export async function updateContactEmbedding(contactId: string): Promise<void> {
  const supabase = await createClient()

  // Pull all signals and communications for this contact
  const [{ data: signals }, { data: comms }, { data: contact }] = await Promise.all([
    supabase.from('signals').select('raw_content, type, occurred_at').eq('contact_id', contactId).order('occurred_at', { ascending: false }).limit(50),
    supabase.from('communication_embeddings').select('content_text').eq('contact_id', contactId).order('occurred_at', { ascending: false }).limit(20),
    supabase.from('contacts').select('first_name, last_name, email, job_title, company:companies(name, industry)').eq('id', contactId).single(),
  ])

  const contextText = [
    `${contact?.first_name} ${contact?.last_name}, ${contact?.job_title} at ${contact?.company?.name} (${contact?.company?.industry})`,
    ...(signals?.map(s => `${s.type}: ${s.raw_content}`) ?? []),
    ...(comms?.map(c => c.content_text) ?? []),
  ].join('\n').slice(0, 8000)  // token limit

  const embedding = await embedText(contextText)

  await supabase.from('contact_embeddings').upsert({
    contact_id: contactId,
    embedding: JSON.stringify(embedding),
    last_updated: new Date().toISOString(),
    signal_count: signals?.length ?? 0,
  }, { onConflict: 'contact_id' })
}
```

### Semantic Search API (src/app/api/intelligence/search/route.ts)

```typescript
export async function POST(request: NextRequest) {
  const { query, limit = 10 } = await request.json()
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()

  const embedding = await embedText(query)

  // Vector similarity search via ruvector/pgvector SQL
  const { data } = await auth.supabase.rpc('semantic_search_contacts', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.7,
    match_count: limit,
  })

  return ok(data)
}

// In migration 0006_intelligence_functions.sql:
// CREATE FUNCTION semantic_search_contacts(query_embedding VECTOR, match_threshold FLOAT, match_count INT)
// RETURNS TABLE (contact_id UUID, similarity FLOAT) AS $$
//   SELECT contact_id, 1 - (embedding <=> query_embedding) as similarity
//   FROM contact_embeddings
//   WHERE 1 - (embedding <=> query_embedding) > match_threshold
//   ORDER BY embedding <=> query_embedding
//   LIMIT match_count;
// $$ LANGUAGE SQL;
```

---

## ruflo Integration — Implementation

### Setup

```bash
# Install ruflo in the project
curl -fsSL https://cdn.jsdelivr.net/gh/ruvnet/claude-flow@main/scripts/install.sh | bash

# Or via npx
npx ruflo@latest init --project minicrm

# This creates:
# .ruflo/
#   config.json          — agent configuration
#   hooks/               — hook definitions
#   agents/              — custom agent definitions
#   patterns/            — learned patterns (auto-populated over time)
#   knowledge/           — HNSW vector knowledge store (backed by ruvector)
```

### Custom Agent Definitions (.ruflo/agents/deal-health.agent.ts)

```typescript
import { RufloAgent } from 'ruflo'
import { createClient } from '@/lib/supabase/server'

export const DealHealthAgent: RufloAgent = {
  name: 'DealHealthAgent',
  description: 'Continuously monitors deal health based on signal activity',
  trigger: 'signal.received | schedule.every_30m',

  async execute(context) {
    const { deal_id } = context.payload
    const supabase = await createClient()

    // Fetch recent signals
    const { data: signals } = await supabase
      .from('signals')
      .select('type, predictive_weight, sentiment_score, occurred_at')
      .eq('deal_id', deal_id)
      .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('occurred_at', { ascending: false })

    // Compute health score components
    const recency_score = computeRecencyScore(signals)
    const sentiment_score = computeSentimentTrend(signals)
    const engagement_score = computeEngagementLevel(signals)
    const pattern_score = await compareToWonDeals(deal_id)  // ruvector similarity

    const health = (
      recency_score * 0.30 +
      sentiment_score * 0.25 +
      engagement_score * 0.25 +
      pattern_score * 0.20
    ) * 100

    // Update deal signature
    const { data: current } = await supabase
      .from('deal_signatures')
      .select('health_score')
      .eq('deal_id', deal_id)
      .single()

    const drop = (current?.health_score ?? 50) - health

    await supabase.from('deal_signatures').upsert({
      deal_id,
      health_score: health,
      momentum: computeMomentum(signals),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'deal_id' })

    // Trigger downstream hooks if health dropped significantly
    if (drop > 15) {
      context.emit('deal.health_drop', { deal_id, previous_health: current?.health_score, current_health: health, drop })
    }

    return { health, drop }
  }
}
```

### The Intelligence Card Creation Flow

```
Signal arrives (webhook)
  ↓
ruflo hook triggers relevant agents
  ↓
Agent analyzes signal against ruvector patterns
  ↓
If actionable insight found:
  └─► Create intelligence_card in DB
        title: "TechFlow showing strong close signals"
        evidence: { signals: [...], pattern_match: "87% similar to 5 recent wins" }
        recommended_action: "Propose contract"
        recommended_payload: { email_template: "closing_proposal", deal_id: "..." }
        confidence: 0.87
        priority: "high"
  ↓
UI polls intelligence_cards (or Supabase Realtime pushes it)
  ↓
Card appears in Focus Feed
  ↓
Human takes action (creates activity, sends email)
  ↓
Outcome tracked N days later
  ↓
OutcomeRecorderAgent updates Q-table and signal weights
```

---

## New API Routes Required

```
# Intelligence
POST   /api/intelligence/search            — semantic search query
POST   /api/intelligence/icp/build         — build ICP from selected contacts
GET    /api/intelligence/icp/score/:id     — ICP score for a contact
GET    /api/intelligence/similar/:contactId — find similar contacts
GET    /api/intelligence/deal-patterns/:id  — deal signature analysis
POST   /api/intelligence/cards             — create intelligence card (ruflo internal)
PATCH  /api/intelligence/cards/:id         — mark actioned/dismissed/snoozed
GET    /api/intelligence/cards             — get open cards for current user
GET    /api/intelligence/briefing          — daily AI briefing for current user

# Signals
POST   /api/signals                        — create signal (used by ruflo agents)
GET    /api/signals                        — query signals (by contact/deal/type)
PATCH  /api/signals/:id/weight             — update predictive weight (ruflo internal)

# Learning
POST   /api/learning/reward                — record action outcome (ruflo internal)
GET    /api/learning/next-action           — get recommended next action for a deal
GET    /api/learning/patterns/won          — describe patterns of won deals
```

---

## Implementation Roadmap

### Phase 1 — Signal Foundation (build on current codebase)
All existing integration webhooks (Gmail, Stripe, Mailchimp, Calendly) create `Signal` records in addition to their current behavior. No ML yet — just rich structured data.

**Deliverables:** `signals` table, signal ingestion in all webhook routes, signal timeline UI component.

**Measure:** Signal count per deal per stage. Baseline for future comparison.

### Phase 2 — Embedding Layer (ruvector)
Install ruvector extension. Generate embeddings for all existing contacts, deals, and communications (backfill job). Build semantic search API.

**Deliverables:** `contact_embeddings`, `deal_signatures`, `communication_embeddings` tables. Semantic search endpoint. "Find similar contacts" feature.

**Measure:** ICP match accuracy: do manually-selected "good customers" cluster together? Cosine similarity should be >0.75 within cluster.

### Phase 3 — Intelligence Cards (ruflo agents)
Install ruflo. Implement DealHealthAgent, ContactDecayAgent, ICPMatchAgent. Surface cards in Focus Feed. No learning yet — rules-based thresholds.

**Deliverables:** Intelligence card system. Focus Feed view. Deal health scores visible on Kanban cards.

**Measure:** Card acceptance rate (action taken vs. dismissed). Target >40% acceptance on high-priority cards.

### Phase 4 — Learning Loops (self-optimization)
Close the feedback loop. OutcomeRecorderAgent tracks what happens after each card action. WeightUpdaterAgent refines signal weights. Q-learning table accumulates data.

**Deliverables:** Action tracking, Q-learning table, signal weight updates. Prediction accuracy begins improving automatically.

**Measure:** Deal close probability MAE (mean absolute error) should decrease quarter-over-quarter. Target <15% MAE after 50 closed deals.

### Phase 5 — Intelligence Interface
Rebuild the UI around intelligence-first views. Relationship graph, momentum board, signal timeline, natural language query interface.

**Deliverables:** All views described in Layer 4. Mobile-optimized Focus Feed. Query interface.

**Measure:** Time to first action from login (should drop). Number of deals touched per day. Win rate change.

---

## Success Metrics

The system is measurably working when:

| Metric | Baseline | Target after 6 months |
|---|---|---|
| Manual data entry events per week | 100% human-logged | <30% (70% auto-captured) |
| Deal close probability MAE | N/A (no prediction) | <15% |
| Focus Feed action acceptance rate | N/A | >45% |
| Time spent on CRM maintenance | 40% of selling time | <10% |
| "Surprised by a lost deal" incidents | Common | Rare (>80% at-risk flagged 2wks prior) |
| Semantic search result relevance | N/A | >80% user satisfaction |
| Signal-to-insight latency | Never (no signals) | <5 minutes |
| ICP score correlation with LTV | N/A | r² > 0.6 |

---

## What This Is That No CRM Has Today

| Capability | Salesforce | HubSpot | miniCRM (this design) |
|---|---|---|---|
| Data source | Human entry + APIs | Human entry + APIs | Automatic signal capture |
| Contact understanding | Fields you fill | Fields you fill | Learned semantic model |
| Deal probability | You type a % | Lead score (rule-based) | Distance to won/lost cluster |
| Recommendations | Rule-based playbooks | AI suggestions (generic) | Q-learned from YOUR outcomes |
| Search | SQL/keyword | Keyword | Semantic: "find contacts like my best customer" |
| Self-improvement | Never | Never | Continuous — every outcome sharpens the model |
| Relationship graph | Flat contact list | Flat contact list | Weighted graph with second-degree connections |
| Communication memory | You write notes | You write notes | Semantic: searchable by topic/intent/sentiment |
| Integration depth | Record import | Record import | Signal fabric with interpreted behavioral meaning |
| Privacy | Vendor-hosted | Vendor-hosted | Fully self-hosted — your data never leaves your VPS |

The last point is not incidental. The intelligence compounds on data that no vendor can monetize, sell, or lose in a breach. The model that learns from your deals belongs to you.
