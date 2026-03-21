// HubSpot integration via Private App token (no OAuth needed)
// User creates a Private App in HubSpot Settings → Integrations → Private Apps
// and pastes the token (hapt-...) into Settings → Integrations in miniCRM.

export interface HubSpotContact {
  id: string
  properties: {
    firstname?: string
    lastname?: string
    email?: string
    phone?: string
    mobilephone?: string
    jobtitle?: string
    company?: string
    hs_lead_status?: string
    associatedcompanyid?: string
    createdate?: string
  }
}

export interface HubSpotCompany {
  id: string
  properties: {
    name?: string
    domain?: string
    industry?: string
    phone?: string
    website?: string
    city?: string
    state?: string
    numberofemployees?: string
    createdate?: string
  }
}

export interface HubSpotDeal {
  id: string
  properties: {
    dealname?: string
    amount?: string
    dealstage?: string
    closedate?: string
    hs_deal_stage_probability?: string
    createdate?: string
    associations?: string
  }
  associations?: {
    contacts?: { results: Array<{ id: string; type: string }> }
    companies?: { results: Array<{ id: string; type: string }> }
  }
}

export function getHubSpotClient(accessToken: string) {
  const BASE = 'https://api.hubapi.com'

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message ?? `HubSpot API error: ${res.status}`)
    }
    return res.json()
  }

  async function* paginate<T>(path: string, properties: string[]): AsyncGenerator<T[]> {
    const propParam = properties.map(p => `properties=${p}`).join('&')
    let after: string | undefined

    while (true) {
      const cursor = after ? `&after=${after}` : ''
      const data = await request<{ results: T[]; paging?: { next?: { after: string } } }>(
        `${path}?limit=100&${propParam}${cursor}`
      )
      if (data.results.length > 0) yield data.results
      if (!data.paging?.next?.after) break
      after = data.paging.next.after
    }
  }

  return {
    // Verify token works
    getAccountInfo: () =>
      request<{ portalId: number; timeZone: string; companyCurrency: string }>(
        '/account-info/v3/details'
      ),

    // Paginated generators
    contacts: () =>
      paginate<HubSpotContact>('/crm/v3/objects/contacts', [
        'firstname', 'lastname', 'email', 'phone', 'mobilephone',
        'jobtitle', 'company', 'hs_lead_status', 'associatedcompanyid',
      ]),

    companies: () =>
      paginate<HubSpotCompany>('/crm/v3/objects/companies', [
        'name', 'domain', 'industry', 'phone', 'website',
        'city', 'state', 'numberofemployees',
      ]),

    deals: () =>
      paginate<HubSpotDeal>('/crm/v3/objects/deals?associations=contacts,companies', [
        'dealname', 'amount', 'dealstage', 'closedate',
        'hs_deal_stage_probability',
      ]),

    // Count endpoints (for preview)
    countContacts: () =>
      request<{ total: number }>('/crm/v3/objects/contacts?limit=1').then(_d =>
        // HubSpot doesn't return total in v3, use search API
        request<{ total: number }>('/crm/v3/objects/contacts/search', {
          method: 'POST',
          body: JSON.stringify({ filterGroups: [], limit: 1 }),
        })
      ),

    countCompanies: () =>
      request<{ total: number }>('/crm/v3/objects/companies/search', {
        method: 'POST',
        body: JSON.stringify({ filterGroups: [], limit: 1 }),
      }),

    countDeals: () =>
      request<{ total: number }>('/crm/v3/objects/deals/search', {
        method: 'POST',
        body: JSON.stringify({ filterGroups: [], limit: 1 }),
      }),
  }
}
