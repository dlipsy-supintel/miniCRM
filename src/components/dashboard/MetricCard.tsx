import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  violet: 'bg-violet-500/10 text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
}

interface MetricCardProps {
  title: string
  value: string | number
  sub: string
  icon: LucideIcon
  color: keyof typeof colorMap
}

export function DashboardMetricCard({ title, value, sub, icon: Icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={cn('p-2 rounded-lg', colorMap[color])}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
