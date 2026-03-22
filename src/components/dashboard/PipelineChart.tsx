'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface StageData {
  stage_id: string
  name: string
  color: string
  count: number
  value: number
}

interface ChartEntry {
  name: string
  value: number
  count: number
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload as ChartEntry
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm font-semibold text-foreground">
          ${entry.value.toLocaleString()}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {entry.count} {entry.count === 1 ? 'deal' : 'deals'}
      </p>
    </div>
  )
}

export function PipelineChart({ data }: { data: StageData[] }) {
  const chartData: ChartEntry[] = data.map(s => ({
    name: s.name,
    value: s.value,
    count: s.count,
    color: s.color,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Pipeline by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No deals yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
