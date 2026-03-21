'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle, ExternalLink, AlertCircle, RefreshCw, Loader2,
  ChevronDown, ChevronUp, Settings2, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TokenInfo {
  provider: string
  enabled: boolean
  metadata: Record<string, unknown>
  token_expires_at: string | null
  updated_at: string
}

interface CredentialInfo {
  loaded: boolean
  has_credentials: boolean
  client_id: string | null
}

const INTEGRATIONS = [
  {
    provider: 'hubspot',
    name: 'HubSpot',
    description: 'Import contacts, companies, and deals from your HubSpot CRM.',
    logo: '🟠',
    oauthFlow: false,
    needsAppCredentials: false,
    syncPath: null as string | null,
    connectPath: null as string | null,
    tokenLabel: 'Private App Token',
    tokenPlaceholder: 'hapt-...',
    tokenHelp: 'HubSpot → Settings → Integrations → Private Apps → Create app',
  },
  {
    provider: 'google',
    name: 'Google Workspace',
    description: 'Sync Gmail emails and Google Calendar meetings with your contacts and deals.',
    logo: '🔵',
    oauthFlow: true,
    needsAppCredentials: true,
    connectPath: '/api/integrations/google/connect',
    syncPath: '/api/integrations/google/gmail/sync',
    credentialHelp: 'Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID',
  },
  {
    provider: 'mailchimp_a',
    name: 'Mailchimp — Group A',
    description: 'A/B test group A: import and sync contacts from your first Mailchimp audience.',
    logo: '🐒',
    oauthFlow: true,
    needsAppCredentials: true,
    credentialsProvider: 'mailchimp', // shares credentials with mailchimp
    connectPath: '/api/integrations/mailchimp/connect?variant=a',
    syncPath: '/api/integrations/mailchimp/sync?variant=a',
    credentialHelp: 'Mailchimp → Account → Extras → Registered Apps → Register An App',
  },
  {
    provider: 'mailchimp_b',
    name: 'Mailchimp — Group B',
    description: 'A/B test group B: import and sync contacts from your second Mailchimp audience.',
    logo: '🐒',
    oauthFlow: true,
    needsAppCredentials: true,
    credentialsProvider: 'mailchimp', // shares credentials with mailchimp
    connectPath: '/api/integrations/mailchimp/connect?variant=b',
    syncPath: '/api/integrations/mailchimp/sync?variant=b',
    credentialHelp: 'Mailchimp → Account → Extras → Registered Apps → Register An App',
  },
  {
    provider: 'stripe',
    name: 'Stripe',
    description: 'Sync customers → contacts and subscriptions → deals with revenue data.',
    logo: '💳',
    oauthFlow: false,
    needsAppCredentials: false,
    syncPath: '/api/integrations/stripe/sync',
    connectPath: null as string | null,
    tokenLabel: 'Secret Key',
    tokenPlaceholder: 'sk_live_...',
    tokenHelp: 'Stripe Dashboard → Developers → API keys',
  },
  {
    provider: 'calendly',
    name: 'Calendly',
    description: 'Automatically create contacts and meeting activities from Calendly bookings.',
    logo: '📅',
    oauthFlow: true,
    needsAppCredentials: true,
    connectPath: '/api/integrations/calendly/connect',
    syncPath: '/api/integrations/calendly/sync',
    credentialHelp: 'Calendly → Integrations → API & Webhooks → OAuth Apps → Create new app',
  },
  {
    provider: 'resend',
    name: 'Resend',
    description: 'Send emails from the CRM and automatically log them as activities.',
    logo: '✉️',
    oauthFlow: false,
    needsAppCredentials: false,
    syncPath: null as string | null,
    connectPath: null as string | null,
    tokenLabel: 'API Key',
    tokenPlaceholder: 're_...',
    tokenHelp: 'Resend Dashboard → API Keys → Create API Key',
  },
] as const

export function IntegrationsSettings({ tokens }: { tokens: TokenInfo[] }) {
  const [connectedTokens, setConnectedTokens] = useState<Record<string, TokenInfo>>(
    () => Object.fromEntries(tokens.map(t => [t.provider, t]))
  )
  const [credentials, setCredentials] = useState<Record<string, CredentialInfo>>({})
  const [showCredForm, setShowCredForm] = useState<Record<string, boolean>>({})
  const [credFormData, setCredFormData] = useState<Record<string, { client_id: string; client_secret: string }>>({})
  const [savingCreds, setSavingCreds] = useState<string | null>(null)
  const [directTokens, setDirectTokens] = useState<Record<string, string>>({})
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('')
  const [connectingDirect, setConnectingDirect] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  // Load credential status for OAuth providers on mount
  useEffect(() => {
    const oauthProviders = INTEGRATIONS.filter(i => i.needsAppCredentials)
    oauthProviders.forEach(async (integration) => {
      // Some providers share credentials (e.g. mailchimp_a/b share 'mailchimp' creds)
      const credProvider = 'credentialsProvider' in integration ? integration.credentialsProvider : integration.provider
      try {
        const res = await fetch(`/api/integrations/credentials?provider=${credProvider}`)
        const json = await res.json()
        setCredentials(prev => ({
          ...prev,
          [integration.provider]: {
            loaded: true,
            has_credentials: json.data?.has_credentials ?? false,
            client_id: json.data?.client_id ?? null,
          },
        }))
      } catch {
        setCredentials(prev => ({
          ...prev,
          [integration.provider]: { loaded: true, has_credentials: false, client_id: null },
        }))
      }
    })
  }, [])

  async function handleToggle(provider: string, enabled: boolean) {
    const res = await fetch(`/api/integrations/${provider}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
    if (res.ok) {
      setConnectedTokens(prev => ({
        ...prev,
        [provider]: prev[provider] ? { ...prev[provider], enabled } : prev[provider],
      }))
      toast.success(`${enabled ? 'Enabled' : 'Disabled'} ${provider}`)
    }
  }

  async function handleSync(provider: string, syncPath: string) {
    setSyncing(provider)
    try {
      const res = await fetch(syncPath, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Sync failed')
      toast.success(`${provider} synced — ${json.data?.synced ?? 0} records`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(null)
    }
  }

  async function handleSaveCredentials(provider: string) {
    const data = credFormData[provider]
    if (!data?.client_id || !data?.client_secret) return
    setSavingCreds(provider)
    // Use shared credentialsProvider if applicable
    const integration = INTEGRATIONS.find(i => i.provider === provider)
    const credProvider = integration && 'credentialsProvider' in integration ? integration.credentialsProvider : provider
    try {
      const res = await fetch('/api/integrations/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: credProvider, client_id: data.client_id, client_secret: data.client_secret }),
      })
      if (!res.ok) throw new Error('Failed to save credentials')
      setCredentials(prev => ({
        ...prev,
        [provider]: { loaded: true, has_credentials: true, client_id: data.client_id },
      }))
      setShowCredForm(prev => ({ ...prev, [provider]: false }))
      setCredFormData(prev => ({ ...prev, [provider]: { client_id: '', client_secret: '' } }))
      toast.success('Credentials saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save credentials')
    } finally {
      setSavingCreds(null)
    }
  }

  async function handleDeleteCredentials(provider: string) {
    const integration = INTEGRATIONS.find(i => i.provider === provider)
    const credProvider = integration && 'credentialsProvider' in integration ? integration.credentialsProvider : provider
    const res = await fetch(`/api/integrations/credentials?provider=${credProvider}`, { method: 'DELETE' })
    if (res.ok) {
      setCredentials(prev => ({
        ...prev,
        [provider]: { loaded: true, has_credentials: false, client_id: null },
      }))
      toast.success('Credentials removed')
    }
  }

  async function handleConnectDirect(provider: string) {
    const token = directTokens[provider]?.trim()
    if (!token) return
    setConnectingDirect(provider)
    try {
      const body = provider === 'stripe'
        ? { secret_key: token, webhook_secret: stripeWebhookSecret }
        : provider === 'resend'
          ? { api_key: token }
          : { access_token: token }
      const res = await fetch(`/api/integrations/${provider}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? 'Connect failed')
      setConnectedTokens(prev => ({
        ...prev,
        [provider]: { provider, enabled: true, metadata: {}, token_expires_at: null, updated_at: new Date().toISOString() },
      }))
      setDirectTokens(prev => ({ ...prev, [provider]: '' }))
      toast.success(`${provider} connected`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnectingDirect(null)
    }
  }

  async function handleDisconnect(provider: string) {
    setDisconnecting(provider)
    try {
      const res = await fetch(`/api/integrations/${provider}/toggle`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to disconnect')
      setConnectedTokens(prev => {
        const next = { ...prev }
        delete next[provider]
        return next
      })
      toast.success(`${provider} disconnected`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setDisconnecting(null)
    }
  }

  return (
    <div className="space-y-4">
      {INTEGRATIONS.map(integration => {
        const token = connectedTokens[integration.provider]
        const connected = !!token
        const enabled = token?.enabled ?? false
        const cred = credentials[integration.provider]
        const hasCredentials = integration.needsAppCredentials ? (cred?.has_credentials ?? false) : true
        const credLoaded = integration.needsAppCredentials ? (cred?.loaded ?? false) : true
        const isShowingCredForm = showCredForm[integration.provider] ?? false
        const formData = credFormData[integration.provider] ?? { client_id: '', client_secret: '' }

        return (
          <Card key={integration.provider} className={cn('transition-opacity', connected && !enabled && 'opacity-60')}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.logo}</span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {integration.name}
                      {connected ? (
                        <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle size={10} className="mr-1" />Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <AlertCircle size={10} className="mr-1" />Not connected
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">{integration.description}</CardDescription>
                  </div>
                </div>
                {connected && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{enabled ? 'Active' : 'Paused'}</span>
                    <Switch checked={enabled} onCheckedChange={v => handleToggle(integration.provider, v)} />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* OAuth App Credentials section */}
              {integration.needsAppCredentials && (
                <div className="rounded-md border border-dashed p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings2 size={12} className="text-muted-foreground" />
                      <span className="text-xs font-medium">OAuth App Credentials</span>
                      {!credLoaded ? (
                        <Loader2 size={10} className="animate-spin text-muted-foreground" />
                      ) : hasCredentials ? (
                        <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 h-4 px-1.5">
                          <CheckCircle size={8} className="mr-1" />Configured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 h-4 px-1.5">
                          Required
                        </Badge>
                      )}
                    </div>
                    {credLoaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                        onClick={() => setShowCredForm(prev => ({ ...prev, [integration.provider]: !prev[integration.provider] }))}
                      >
                        {isShowingCredForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {hasCredentials ? 'Edit' : 'Set up'}
                      </Button>
                    )}
                  </div>

                  {hasCredentials && !isShowingCredForm && cred?.client_id && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Client ID: {cred.client_id.slice(0, 24)}…
                    </p>
                  )}
                  {credLoaded && !hasCredentials && !isShowingCredForm && (
                    <p className="text-xs text-muted-foreground">{integration.credentialHelp}</p>
                  )}

                  {isShowingCredForm && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-muted-foreground">{integration.credentialHelp}</p>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Client ID</Label>
                        <Input
                          placeholder="Client ID"
                          value={formData.client_id}
                          onChange={e => setCredFormData(prev => ({
                            ...prev,
                            [integration.provider]: { ...formData, client_id: e.target.value },
                          }))}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Client Secret</Label>
                        <Input
                          type="password"
                          placeholder="Client Secret"
                          value={formData.client_secret}
                          onChange={e => setCredFormData(prev => ({
                            ...prev,
                            [integration.provider]: { ...formData, client_secret: e.target.value },
                          }))}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!formData.client_id || !formData.client_secret || savingCreds === integration.provider}
                          onClick={() => handleSaveCredentials(integration.provider)}
                        >
                          {savingCreds === integration.provider && <Loader2 size={12} className="mr-1.5 animate-spin" />}
                          Save credentials
                        </Button>
                        {hasCredentials && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteCredentials(integration.provider)}
                          >
                            <Trash2 size={12} className="mr-1.5" />Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Direct token input (HubSpot, Stripe) — not connected */}
              {!integration.oauthFlow && !connected && 'tokenLabel' in integration && (
                <div className="space-y-2">
                  {'tokenHelp' in integration && (
                    <p className="text-xs text-muted-foreground">{integration.tokenHelp}</p>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">{integration.tokenLabel}</Label>
                    <Input
                      type="password"
                      placeholder={integration.tokenPlaceholder}
                      value={directTokens[integration.provider] ?? ''}
                      onChange={e => setDirectTokens(prev => ({ ...prev, [integration.provider]: e.target.value }))}
                      className="text-sm h-8"
                    />
                  </div>
                  {integration.provider === 'stripe' && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Webhook Signing Secret (optional)</Label>
                      <Input
                        type="password"
                        placeholder="whsec_..."
                        value={stripeWebhookSecret}
                        onChange={e => setStripeWebhookSecret(e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                  )}
                  <Button
                    size="sm"
                    disabled={!directTokens[integration.provider]?.trim() || connectingDirect === integration.provider}
                    onClick={() => handleConnectDirect(integration.provider)}
                  >
                    {connectingDirect === integration.provider
                      ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Connecting…</>
                      : <>Connect {integration.name}</>
                    }
                  </Button>
                </div>
              )}

              {/* OAuth connect button — not connected */}
              {integration.oauthFlow && !connected && (
                <div className="space-y-2">
                  {credLoaded && !hasCredentials && (
                    <p className="text-xs text-amber-500/90">Configure OAuth credentials above before connecting.</p>
                  )}
                  <Button
                    size="sm"
                    disabled={!hasCredentials}
                    onClick={() => { if (integration.connectPath) window.location.href = integration.connectPath }}
                  >
                    <ExternalLink size={12} className="mr-1.5" />
                    Connect {integration.name}
                  </Button>
                </div>
              )}

              {/* Connected actions */}
              {connected && (
                <div className="flex gap-2 flex-wrap items-center">
                  {integration.syncPath && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!enabled || syncing === integration.provider}
                      onClick={() => handleSync(integration.provider, integration.syncPath!)}
                    >
                      {syncing === integration.provider
                        ? <><Loader2 size={12} className="mr-1.5 animate-spin" />Syncing…</>
                        : <><RefreshCw size={12} className="mr-1.5" />Sync now</>
                      }
                    </Button>
                  )}
                  {integration.oauthFlow && integration.connectPath && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      disabled={!hasCredentials}
                      onClick={() => { window.location.href = integration.connectPath! }}
                    >
                      Reconnect
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive ml-auto"
                    disabled={disconnecting === integration.provider}
                    onClick={() => handleDisconnect(integration.provider)}
                  >
                    {disconnecting === integration.provider
                      ? <Loader2 size={12} className="animate-spin" />
                      : 'Disconnect'
                    }
                  </Button>
                </div>
              )}

              {connected && token?.updated_at && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(token.updated_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
