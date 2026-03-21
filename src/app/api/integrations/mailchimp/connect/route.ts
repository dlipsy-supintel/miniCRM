import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMailchimpOAuthUrl } from '@/lib/integrations/mailchimp'
import { signState } from '@/lib/integrations/google'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // variant=a → store as mailchimp_a, variant=b → mailchimp_b, default → mailchimp
  const variant = new URL(request.url).searchParams.get('variant')
  const provider = variant === 'a' ? 'mailchimp_a' : variant === 'b' ? 'mailchimp_b' : 'mailchimp'

  try {
    const state = signState({ org_id: profile.org_id, user_id: user.id, provider })
    // Always use base 'mailchimp' credentials for OAuth regardless of variant
    return NextResponse.redirect(await getMailchimpOAuthUrl(state, profile.org_id))
  } catch (err) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const msg = err instanceof Error ? err.message : 'config_error'
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent(msg)}`)
  }
}
