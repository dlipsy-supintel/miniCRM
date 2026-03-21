import { getCredentials } from '@/lib/integrations/credentials'

export function getMailchimpClient(accessToken: string, dataCenter: string) {
  const baseUrl = `https://${dataCenter}.api.mailchimp.com/3.0`

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? `Mailchimp API error: ${res.status}`)
    }
    return res.json()
  }

  return {
    getLists: () => request<{ lists: Array<{ id: string; name: string; stats: { member_count: number } }> }>('/lists?count=20'),
    getMembers: (listId: string, offset = 0) =>
      request<{ members: Array<{ id: string; email_address: string; full_name: string; status: string; merge_fields: Record<string, string> }> }>(
        `/lists/${listId}/members?count=100&offset=${offset}`
      ),
    subscribeMember: (listId: string, email: string, data: object) =>
      request(`/lists/${listId}/members`, { method: 'POST', body: JSON.stringify({ email_address: email, status: 'subscribed', ...data }) }),
    getCampaigns: () => request<{ campaigns: Array<{ id: string; settings: { subject_line: string }; send_time: string }> }>('/campaigns?count=20&status=sent'),
  }
}

export async function getMailchimpOAuthUrl(state: string, orgId: string): Promise<string> {
  const creds = await getCredentials('mailchimp', orgId)
  const clientId = creds?.client_id ?? process.env.MAILCHIMP_CLIENT_ID
  if (!clientId) throw new Error('Mailchimp OAuth credentials not configured')
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/mailchimp/callback`,
    state,
  })
  return `https://login.mailchimp.com/oauth2/authorize?${params}`
}
