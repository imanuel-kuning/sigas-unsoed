'use client'

import { index } from '@/actions/functions'
import { BarChart, LineChart } from '@/components/app-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocation } from '@/hooks/use-location'
import { groupByWeeks } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

export default function Page() {
  const { province } = useLocation()
  const [isPending, setTransition] = useTransition()
  const [bar, setBar] = useState<ChartProps>()
  const [line, setLine] = useState<ChartProps>()

  useEffect(() => {
    setTransition(async () => {
      const { labels, datasets } = groupByWeeks(await index('main', 'post', { location: province }))
      setBar({
        labels: labels,
        datasets: [
          {
            label: 'Total',
            data: datasets.map((data) => data.length),
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
          },
        ],
      })
      setLine({
        labels: labels,
        datasets: [
          {
            label: 'Positif',
            data: datasets.map((data) => data.filter((item) => item.sentiment === 'positive').length),
            backgroundColor: '#10B981',
            borderColor: '#10B981',
          },
          {
            label: 'Negatif',
            data: datasets.map((data) => data.filter((item) => item.sentiment === 'negative').length),
            backgroundColor: '#EF4444',
            borderColor: '#EF4444',
          },
        ],
      })
    })
  }, [province])
  return (
    <div className="grid md:grid-cols-2 gap-2">
      <Card className="rounded">
        <CardHeader>
          <CardTitle className="flex justify-between">Chart Bar {isPending && <Loader2 size={17} className="animate-spin" />}</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={bar ?? { labels: [], datasets: [] }} />
        </CardContent>
      </Card>

      <Card className="rounded">
        <CardHeader>
          <CardTitle className="flex justify-between">Chart Line {isPending && <Loader2 size={17} className="animate-spin" />}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={line ?? { labels: [], datasets: [] }} />
        </CardContent>
      </Card>
    </div>
  )
}
