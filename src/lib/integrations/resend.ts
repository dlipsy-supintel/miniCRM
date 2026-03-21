export function getResendClient(apiKey: string) {
  const BASE = 'https://api.resend.com'

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? `Resend API error: ${res.status}`)
    }
    return res.json()
  }

  return {
    verifyKey: () => request<{ id: string; name: string }>('/api-keys'),
    sendEmail: (payload: {
      from: string
      to: string[]
      subject: string
      html?: string
      text?: string
      reply_to?: string
    }) => request<{ id: string }>('/emails', { method: 'POST', body: JSON.stringify(payload) }),
  }
}
