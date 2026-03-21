'use client'

import { useState } from 'react'
import { Users, Mail, Building2, TrendingUp, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ImportResult {
  imported: number
  skipped: number
  errors: number
}

interface HubSpotPreview {
  contacts: number
  companies: number
  deals: number
  portal_id: number
}

interface MailchimpAudience {
  id: string
  name: string
  stats: { member_count: number }
}

interface ImportSettingsProps {
  connected: { google: boolean; mailchimp: boolean; hubspot: boolean }
}

export function ImportSettings({ connected: initialConnected }: ImportSettingsProps) {
  const [connected, setConnected] = useState(initialConnected)

  return (
    <Tabs defaultValue="hubspot">
      <TabsList className="mb-6">
        <TabsTrigger value="hubspot" className="flex items-center gap-1.5">
          <Building2 size={13} /> HubSpot
          {connected.hubspot && <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-0 text-xs py-0">Connected</Badge>}
        </TabsTrigger>
        <TabsTrigger value="gmail" className="flex items-center gap-1.5">
          <Mail size={13} /> Gmail
          {connected.google && <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-0 text-xs py-0">Connected</Badge>}
        </TabsTrigger>
        <TabsTrigger value="mailchimp" className="flex items-center gap-1.5">
          <Users size={13} /> Mailchimp
          {connected.mailchimp && <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-0 text-xs py-0">Connected</Badge>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="hubspot">
        <HubSpotImport connected={connected.hubspot} onConnected={() => setConnected(p => ({ ...p, hubspot: true }))} />
      </TabsContent>
      <TabsContent value="gmail">
        <GmailImport connected={connected.google} />
      </TabsContent>
      <TabsContent value="mailchimp">
        <MailchimpImport connected={connected.mailchimp} />
      </TabsContent>
    </Tabs>
  )
}

// --- HubSpot ---
function HubSpotImport({ connected, onConnected }: { connected: boolean; onConnected: () => void }) {
  const [token, setToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [preview, setPreview] = useState<HubSpotPreview | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<Record<string, ImportResult> | null>(null)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setConnecting(true)
    const res = await fetch('/api/integrations/hubspot/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success('HubSpot connected')
      onConnected()
      setToken('')
      handlePreview()
    } else {
      toast.error(json.error ?? 'Failed to connect')
    }
    setConnecting(false)
  }

  async function handlePreview() {
    setPreviewing(true)
    const res = await fetch('/api/integrations/hubspot/preview')
    const json = await res.json()
    if (res.ok) setPreview(json.data)
    else toast.error(json.error ?? 'Failed to load preview')
    setPreviewing(false)
  }

  async function handleImport(types: string[]) {
    setImporting(true)
    toast.info('Import started — this may take a minute for large accounts…')
    const res = await fetch('/api/integrations/hubspot/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types }),
    })
    const json = await res.json()
    if (res.ok) {
      setResults(json.data)
      toast.success('Import complete!')
    } else {
      toast.error(json.error ?? 'Import failed')
    }
    setImporting(false)
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-5 space-y-4">
          <h3 className="font-medium">Connect HubSpot</h3>
          <p className="text-sm text-muted-foreground">
            Create a Private App token in HubSpot to import your contacts, companies, and deals.
          </p>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Go to HubSpot → Settings → Integrations → Private Apps</li>
            <li>Click <strong className="text-foreground">Create a private app</strong></li>
            <li>Under Scopes, enable: <code className="text-xs bg-muted px-1 rounded">crm.objects.contacts.read</code>, <code className="text-xs bg-muted px-1 rounded">crm.objects.companies.read</code>, <code className="text-xs bg-muted px-1 rounded">crm.objects.deals.read</code></li>
            <li>Copy the token (<code className="text-xs bg-muted px-1 rounded">hapt-...</code>) and paste below</li>
          </ol>
          <form onSubmit={handleConnect} className="flex gap-2 max-w-lg">
            <Input
              placeholder="hapt-xxxx-xxxx-xxxx-xxxx"
              value={token}
              onChange={e => setToken(e.target.value)}
              className="font-mono text-sm"
            />
            <Button type="submit" disabled={connecting || !token.trim()}>
              {connecting ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Connecting…</> : 'Connect'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 size={15} className="text-emerald-400" />
        <span>HubSpot connected</span>
        {preview && <span className="text-muted-foreground">— Portal {preview.portal_id}</span>}
        <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={handlePreview} disabled={previewing}>
          {previewing ? <Loader2 size={12} className="animate-spin" /> : 'Refresh counts'}
        </Button>
      </div>

      {!preview && !previewing && (
        <Button size="sm" variant="outline" onClick={handlePreview}>
          Check what&apos;s available to import
        </Button>
      )}

      {previewing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Loading HubSpot counts…
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <PreviewCard icon={Users} label="Contacts" count={preview.contacts} />
            <PreviewCard icon={Building2} label="Companies" count={preview.companies} />
            <PreviewCard icon={TrendingUp} label="Deals" count={preview.deals} />
          </div>

          {results ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Import Results</h4>
              {Object.entries(results).map(([type, r]) => (
                <ResultRow key={type} label={type} result={r} />
              ))}
              <Button size="sm" onClick={() => handleImport(['contacts', 'companies', 'deals'])} disabled={importing}>
                Import Again (skips existing)
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handleImport(['companies', 'contacts', 'deals'])}
                disabled={importing}
              >
                {importing ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Importing…</> : 'Import Everything'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleImport(['contacts'])} disabled={importing}>
                Contacts only
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleImport(['companies'])} disabled={importing}>
                Companies only
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleImport(['deals'])} disabled={importing}>
                Deals only
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Existing records matched by HubSpot ID or email are skipped — safe to re-run.
          </p>
        </div>
      )}
    </div>
  )
}

// --- Gmail ---
function GmailImport({ connected }: { connected: boolean }) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ scanned: number; discovered: number; created: number; skipped: number } | null>(null)

  async function handleExtract() {
    setRunning(true)
    toast.info('Scanning sent mail… this may take 30–60 seconds')
    const res = await fetch('/api/integrations/google/gmail/extract-contacts', { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setResult(json.data)
      toast.success(`Done! ${json.data.created} new contacts created`)
    } else {
      toast.error(json.error ?? 'Failed')
    }
    setRunning(false)
  }

  if (!connected) {
    return (
      <div className="rounded-lg border border-border p-5 space-y-3">
        <h3 className="font-medium">Connect Google first</h3>
        <p className="text-sm text-muted-foreground">
          Go to <strong>Settings → Integrations</strong> and connect your Google account to enable Gmail contact extraction.
        </p>
        <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings/integrations'}>
          Go to Integrations <ExternalLink size={12} className="ml-1.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-5 space-y-4">
        <h3 className="font-medium">Extract Contacts from Gmail Sent Mail</h3>
        <p className="text-sm text-muted-foreground">
          Scans your last 6 months of sent emails to find everyone you&apos;ve contacted. Creates new contact records for any email addresses not already in the CRM, and adds email context as notes.
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Parses TO and CC recipients from sent mail</li>
          <li>Creates contacts with name extracted from email headers</li>
          <li>Adds a note summarising email subjects as context</li>
          <li>Links existing synced emails to matched contacts</li>
          <li>Skips addresses already in your contacts</li>
        </ul>

        {result && (
          <div className="rounded-md bg-muted/40 p-3 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Emails scanned:</span> <strong>{result.scanned}</strong></p>
            <p><span className="text-muted-foreground">Unique addresses found:</span> <strong>{result.discovered}</strong></p>
            <p><span className="text-emerald-400">New contacts created:</span> <strong>{result.created}</strong></p>
            <p><span className="text-muted-foreground">Already existed (skipped):</span> <strong>{result.skipped}</strong></p>
          </div>
        )}

        <Button onClick={handleExtract} disabled={running}>
          {running
            ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Scanning sent mail…</>
            : result ? 'Scan Again' : 'Extract Contacts from Sent Mail'
          }
        </Button>
      </div>
    </div>
  )
}

// --- Mailchimp ---
function MailchimpImport({ connected }: { connected: boolean }) {
  const [audiences, setAudiences] = useState<MailchimpAudience[] | null>(null)
  const [loadingAudiences, setLoadingAudiences] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function loadAudiences() {
    setLoadingAudiences(true)
    const res = await fetch('/api/integrations/mailchimp/audiences')
    const json = await res.json()
    if (res.ok) {
      setAudiences(json.data)
      if (json.data.length === 1) setSelectedAudience(json.data[0].id)
    } else {
      toast.error(json.error ?? 'Failed to load audiences')
    }
    setLoadingAudiences(false)
  }

  async function handleImport() {
    if (!selectedAudience) return
    setImporting(true)
    const res = await fetch('/api/integrations/mailchimp/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience_id: selectedAudience }),
    })
    const json = await res.json()
    if (res.ok) {
      setResult(json.data)
      toast.success('Mailchimp import complete')
    } else {
      toast.error(json.error?.message ?? json.error ?? 'Import failed')
    }
    setImporting(false)
  }

  if (!connected) {
    return (
      <div className="rounded-lg border border-border p-5 space-y-3">
        <h3 className="font-medium">Connect Mailchimp first</h3>
        <p className="text-sm text-muted-foreground">
          Go to <strong>Settings → Integrations</strong> to connect your Mailchimp account.
        </p>
        <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings/integrations'}>
          Go to Integrations <ExternalLink size={12} className="ml-1.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-5 space-y-4">
        <h3 className="font-medium">Import Mailchimp Audience</h3>
        <p className="text-sm text-muted-foreground">
          Imports all subscribers from a Mailchimp audience as contacts. Deduplicates by email — safe to re-run.
        </p>

        {!audiences ? (
          <Button size="sm" variant="outline" onClick={loadAudiences} disabled={loadingAudiences}>
            {loadingAudiences ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Loading…</> : 'Load My Audiences'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Audience</Label>
              <Select value={selectedAudience} onValueChange={v => setSelectedAudience(v ?? '')}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Choose an audience…" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} <span className="text-muted-foreground ml-2">({a.stats.member_count.toLocaleString()} members)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {result && <ResultRow label="Mailchimp contacts" result={result} />}

            <Button onClick={handleImport} disabled={importing || !selectedAudience}>
              {importing ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Importing…</> : 'Import Audience'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Shared sub-components
function PreviewCard({ icon: Icon, label, count }: { icon: React.FC<{ size?: number; className?: string }>; label: string; count: number }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <Icon size={16} className="text-muted-foreground mx-auto mb-1" />
      <p className="text-xl font-semibold">{count.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ResultRow({ label, result }: { label: string; result: ImportResult }) {
  return (
    <div className="flex items-center gap-3 text-sm rounded-md bg-muted/30 px-3 py-2">
      <span className="capitalize font-medium w-24">{label}</span>
      <span className="text-emerald-400">{result.imported} imported</span>
      <span className="text-muted-foreground">{result.skipped} skipped</span>
      {result.errors > 0 && (
        <span className="flex items-center gap-1 text-destructive">
          <AlertCircle size={12} />{result.errors} errors
        </span>
      )}
    </div>
  )
}
