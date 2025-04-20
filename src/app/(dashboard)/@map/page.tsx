'use client'

import { index } from '@/actions/functions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { groupLocationSentiment } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState, useTransition } from 'react'

export default function Page() {
  const [isPending, setTransition] = useTransition()
  const [data, setData] = useState<GroupedResult[]>([])

  const LazyMap = useMemo(
    () =>
      dynamic(() => import('@/components/app-map'), {
        ssr: false,
      }),
    []
  )

  useEffect(() => {
    setTransition(async () => {
      setData(groupLocationSentiment(await index('main', 'post')))
    })
  }, [])

  return (
    <Card className="rounded">
      <CardHeader>
        <CardTitle>Peta Choropleth {isPending && <Loader2 className="animate-spin" />}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="w-1/4"></div>
        <LazyMap data={data} width="auto" height="60vh" center={[-2.5, 120]} zoom={5} />
      </CardContent>
    </Card>
  )
}
