import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Video, CheckSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Activity } from '@/types/crm'

const typeIcon = { call: Phone, email: Mail, meeting: Video, task: CheckSquare }
const typeBadge = {
  call: 'bg-blue-500/10 text-blue-400',
  email: 'bg-violet-500/10 text-violet-400',
  meeting: 'bg-emerald-500/10 text-emerald-400',
  task: 'bg-amber-500/10 text-amber-400',
}

export function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No activities yet</p>
        )}
        {activities.slice(0, 6).map(activity => {
          const Icon = typeIcon[activity.type]
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-md shrink-0 ${typeBadge[activity.type]}`}>
                <Icon size={12} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{activity.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
