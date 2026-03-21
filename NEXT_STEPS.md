# Next Steps

Remaining work to take miniCRM from "builds cleanly" to "fully operational with all integrations". Items are ordered by dependency — complete earlier items before later ones.

---

## 1. Supabase Setup (Blocker — nothing works without this)

**Status:** Code complete, database not yet provisioned.

### What to do
Follow SETUP.md Steps 2–3 exactly. The critical detail is the **auth hook** — without it, every authenticated query returns empty because `get_org_id()` reads `org_id` from the JWT, which only gets injected by `custom_access_token_hook`.

### Verify it worked
After creating your workspace at `/register`, run this in the Supabase SQL editor:
```sql
SELECT * FROM organizations;
SELECT * FROM profiles;
SELECT * FROM pipeline_stages;
```
You should see 1 org, 1 profile (role = 'owner'), and 5 default pipeline stages.

---

## 2. Environment Variables

**File:** `.env.local` (copy from `.env.example`)

### Required for core functionality
| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, `https://crm.yourdomain.com` in prod |
| `INTEGRATION_STATE_SECRET` | `openssl rand -hex 32` |
| `SYNC_CRON_SECRET` | `openssl rand -hex 32` |

### Required per integration (add when setting up each one)
| Variable | Integration |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Workspace |
| `GOOGLE_CLIENT_SECRET` | Google Workspace |
| `MAILCHIMP_CLIENT_ID` | Mailchimp |
| `MAILCHIMP_CLIENT_SECRET` | Mailchimp |
| `CALENDLY_CLIENT_ID` | Calendly |
| `CALENDLY_CLIENT_SECRET` | Calendly |

> Stripe secret key is entered by the user in the UI (Settings → Integrations), not stored in `.env`.

---

## 3. Google Workspace Integration

### Create OAuth credentials
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable APIs: **Gmail API**, **Google Calendar API**, **Google People API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URI: `https://crm.yourdomain.com/api/integrations/google/callback`
7. Copy Client ID and Client Secret to `.env.local`

### OAuth consent screen
- User type: **External** (unless you have a Google Workspace org)
- Scopes needed: `gmail.readonly`, `calendar.events.readonly`, `userinfo.email`
- Add test users (your email) while in testing mode
- For production: submit for verification or keep in testing with explicit test users

### Parameters
- The sync endpoint (`/api/integrations/google/gmail/sync`) does **incremental sync** after the first run using Gmail history IDs — it only fetches new messages
- Initial sync pulls the last 100 messages; subsequent runs are fast
- Emails are linked to contacts by matching `from_email` against `contacts.email`
- Cron schedule: every 15 minutes is reasonable; every 5 minutes is fine too

---

## 4. Mailchimp Integration

### Create OAuth app
1. Log in to Mailchimp → **Account → Connected Apps → Register an App**
2. Redirect URI: `https://crm.yourdomain.com/api/integrations/mailchimp/callback`
3. Copy Client ID and Client Secret to `.env.local`

### Audience ID (required for sync)
After a user connects Mailchimp, the sync route looks for `meta.audience_id` in the stored token. You need to either:
- **Option A:** Add a UI input in Settings → Integrations to let the user pick their Mailchimp audience (list) after connecting — this is the cleanest approach
- **Option B:** Auto-select the first audience returned by the API (simpler, works for single-audience accounts)

The audience ID needs to be stored in `integration_tokens.metadata->>'audience_id'` for the sync to work. The `/api/integrations/mailchimp/sync` route currently returns a 400 if `audience_id` is missing.

### Webhook
Register in Mailchimp: **Audience → Manage Contacts → Settings → Webhooks**
- URL: `https://crm.yourdomain.com/api/integrations/mailchimp/webhook?org_id=YOUR_ORG_ID`
- Events: subscribe, unsubscribe, profile update

To get your `org_id`, query Supabase: `SELECT id FROM organizations LIMIT 1;`

---

## 5. Stripe Integration

### No OAuth — key-based
The user enters their Stripe secret key directly in Settings → Integrations. No developer console setup needed.

### Webhook setup
In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
- URL: `https://crm.yourdomain.com/api/integrations/stripe/webhook?org_id=YOUR_ORG_ID`
- Events to listen for:
  - `customer.created`
  - `customer.updated`
  - `invoice.paid`
  - `invoice.payment_failed`
- Copy the **Signing secret** (`whsec_...`) and paste it into the UI when connecting Stripe

### Key recommendation
Create a **restricted key** in Stripe with only read permissions on Customers and Invoices. Do not use the full secret key for production.

---

## 6. Calendly Integration

### Create OAuth app
1. Go to [developer.calendly.com](https://developer.calendly.com) → **Create new app**
2. Redirect URI: `https://crm.yourdomain.com/api/integrations/calendly/callback`
3. Copy Client ID and Client Secret to `.env.local`

### Webhook
Calendly webhooks are not auto-registered by the sync — you need to register them via Calendly's API or their dashboard:
- URL: `https://crm.yourdomain.com/api/integrations/calendly/webhook?org_id=YOUR_ORG_ID`
- Events: `invitee.created`, `invitee.canceled`

The sync route (`/api/integrations/calendly/sync`) pulls the last 20 scheduled events manually. Use cron to keep it fresh.

---

## 7. MCP API Keys

The MCP server at `/api/mcp` requires a Bearer token stored as a bcrypt hash in the `mcp_api_keys` table.

### Create an API key
Currently there's no UI for this — run directly in Supabase SQL editor:

```sql
-- 1. Generate a key (do this in your terminal, not SQL)
--    openssl rand -hex 32
--    Example output: abc123...

-- 2. Hash it (run in Node)
--    node -e "const b = require('bcryptjs'); console.log(b.hashSync('YOUR_KEY', 10))"

-- 3. Insert into DB
INSERT INTO mcp_api_keys (org_id, name, scopes, key_hash, created_by)
VALUES (
  'YOUR_ORG_UUID',
  'Claude Desktop',
  ARRAY['read:contacts', 'write:contacts', 'read:deals', 'write:deals', 'read:activities'],
  '$2a$10$...YOUR_BCRYPT_HASH...',
  'YOUR_USER_UUID'
);
```

### Connect to Claude Desktop
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "miniCRM": {
      "url": "https://crm.yourdomain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_PLAIN_KEY"
      }
    }
  }
}
```

### Available MCP scopes
`read:contacts`, `write:contacts`, `read:deals`, `write:deals`, `read:activities`

### Available MCP tools
`list_contacts`, `get_contact`, `create_contact`, `list_deals`, `get_deal`, `create_deal`, `move_deal_stage`, `list_activities`, `get_pipeline_summary`

---

## 8. Missing UI Features (Future Work)

These are functional gaps where the backend exists but no UI has been built yet:

| Feature | Notes |
|---|---|
| Contact detail page (`/contacts/[id]`) | API route exists at `GET /api/contacts/[id]` |
| Company detail page (`/companies/[id]`) | API route exists at `GET /api/companies/[id]` |
| Deal detail page (`/deals/[id]`) | API route exists at `GET /api/deals/[id]` |
| Notes UI | `POST /api/notes` works; needs a NotesList + NoteForm component |
| Mailchimp audience selector | Needed for sync to work (see Step 4 above) |
| MCP API key management UI | Currently requires raw SQL to create keys |
| Invite team members | Registration creates isolated orgs; no invite flow yet |
| Custom pipeline stages UI | Stages exist in DB; no UI to add/reorder/recolor |
| Search/filter on deals | Kanban currently loads all deals; needs filter bar |
| Pagination on contacts/companies | Initial load is capped at 50; needs cursor/page controls |

---

## 9. Production Hardening (Before Going Live)

- [ ] Set `NEXT_PUBLIC_APP_URL` to your actual domain (not localhost) — OAuth callbacks will break otherwise
- [ ] Confirm Supabase Auth → **Email** provider is enabled
- [ ] Disable Supabase Auth → **Email confirmations** OR configure SMTP so confirmation emails send
- [ ] Set a strong `INTEGRATION_STATE_SECRET` and `SYNC_CRON_SECRET` (never commit these)
- [ ] Use a restricted Stripe key, not the full secret
- [ ] Review Supabase RLS policies in `0002_rls_policies.sql` — they are org-scoped by default
- [ ] Add rate limiting to `/api/mcp` if exposing publicly (currently no rate limit)
- [ ] Set up log rotation for PM2: `pm2 install pm2-logrotate`
- [ ] Back up your Supabase project (enable PITR in Supabase settings for paid plan)
