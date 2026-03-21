import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl, signState } from '@/lib/integrations/google'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 })

  try {
    const state = signState({ org_id: profile.org_id, user_id: user.id })
    const url = await getAuthUrl(state, profile.org_id)
    return NextResponse.redirect(url)
  } catch (err) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const msg = err instanceof Error ? err.message : 'config_error'
    return NextResponse.redirect(`${appUrl}/settings/integrations?error=${encodeURIComponent(msg)}`)
  }
}
