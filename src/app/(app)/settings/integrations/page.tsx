import { createClient } from '@/lib/supabase/server'
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tokens } = await supabase
    .from('integration_tokens')
    .select('provider,enabled,metadata,token_expires_at,updated_at')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your tools to sync data automatically.
        </p>
      </div>
      <IntegrationsSettings tokens={tokens ?? []} />
    </div>
  )
}
