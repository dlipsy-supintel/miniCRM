import { getAuthenticatedUser, ok, unauthorized, serverError } from '@/lib/api'

export async function GET() {
  const auth = await getAuthenticatedUser()
  if (!auth) return unauthorized()

  const { supabase, user } = auth
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile) return unauthorized()

  const { data, error } = await supabase.rpc('get_dashboard_metrics', { p_org_id: profile.org_id })
  if (error) return serverError(error.message)
  return ok(data)
}
