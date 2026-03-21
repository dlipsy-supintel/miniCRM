import { getCredentials } from '@/lib/integrations/credentials'

const CALENDLY_BASE = 'https://api.calendly.com'

export async function getCalendlyOAuthUrl(state: string, orgId: string): Promise<string> {
  const creds = await getCredentials('calendly', orgId)
  const clientId = creds?.client_id ?? process.env.CALENDLY_CLIENT_ID
  if (!clientId) throw new Error('Calendly OAuth credentials not configured')
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/calendly/callback`,
    state,
  })
  return `https://auth.calendly.com/oauth/authorize?${params}`
}

export async function exchangeCalendlyCode(code: string, orgId: string) {
  const creds = await getCredentials('calendly', orgId)
  const clientId = creds?.client_id ?? process.env.CALENDLY_CLIENT_ID
  const clientSecret = creds?.client_secret ?? process.env.CALENDLY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Calendly OAuth credentials not configured')

  const res = await fetch('https://auth.calendly.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/calendly/callback`,
      code,
    }),
  })
  if (!res.ok) throw new Error('Failed to exchange Calendly code')
  return res.json()
}

export function getCalendlyClient(accessToken: string) {
  async function request<T>(path: string): Promise<T> {
    const res = await fetch(`${CALENDLY_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`Calendly API error: ${res.status}`)
    return res.json()
  }

  return {
    getCurrentUser: () => request<{ resource: { uri: string; email: string } }>('/users/me'),
    getScheduledEvents: (userUri: string) =>
      request<{ collection: Array<{ uri: string; name: string; start_time: string; end_time: string; invitees_counter: { active: number } }> }>(
        `/scheduled_events?user=${encodeURIComponent(userUri)}&count=100&status=active`
      ),
    getEventInvitees: (eventUri: string) =>
      request<{ collection: Array<{ email: string; name: string; status: string }> }>(
        `/scheduled_events/${eventUri.split('/').pop()}/invitees`
      ),
  }
}
