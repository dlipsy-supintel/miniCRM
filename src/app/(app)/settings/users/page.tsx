import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace members.</p>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Member</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles?.map(profile => (
              <tr key={profile.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {profile.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0,2) ?? '??'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{profile.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs capitalize">{profile.role}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
