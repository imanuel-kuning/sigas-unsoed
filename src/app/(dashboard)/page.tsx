'use client'

import { count } from '@/actions/functions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BadgeMinus, BadgePlus, MoreHorizontal } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

export default function Home() {
  const [isPending, setTransition] = useTransition()
  const [positiveDataset, setPositiveDataset] = useState<number>(0)
  const [negativeDataset, setNegativeDataset] = useState<number>(0)
  const [positivePost, setPositivePost] = useState<number>(0)
  const [negativePost, setNegativePost] = useState<number>(0)

  useEffect(() => {
    setTransition(async () => {
      const [datasetPos, datasetNeg, postPos, postNeg] = await Promise.all([
        await count('main', 'dataset', { sentiment: 'positive' }),
        await count('main', 'dataset', { sentiment: 'negative' }),
        await count('main', 'post', { sentiment: 'positive' }),
        await count('main', 'post', { sentiment: 'negative' }),
      ])

      setPositiveDataset(datasetPos ?? 0)
      setNegativeDataset(datasetNeg ?? 0)
      setPositivePost(postPos ?? 0)
      setNegativePost(postNeg ?? 0)
    })
  }, [])
  return (
    <section className="grid md:grid-cols-3 gap-2">
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="font-semibold">S</span>istem <span className="font-semibold">I</span>nformasi <span className="font-semibold">G</span>eografis & <span className="font-semibold">A</span>nalisis{' '}
          <span className="font-semibold">S</span>entimen <br />
          <span className="text-xs">by Imanuel Crucifixio</span>
        </CardContent>
      </Card>
      <Card className="rounded md:col-span-2">
        <CardHeader>
          <CardTitle>Distribusi Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h2>Dataset Positif</h2>
                <BadgePlus size={14} />
              </div>
              <h1 className="text-lg font-semibold">{isPending ? <MoreHorizontal className="animate-pulse" /> : positiveDataset}</h1>
            </div>
            <Separator orientation="vertical" className="h-20" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h2>Dataset Negatif</h2>
                <BadgeMinus size={14} />
              </div>
              <h1 className="text-lg font-semibold">{isPending ? <MoreHorizontal className="animate-pulse" /> : negativeDataset}</h1>
            </div>
            <Separator orientation="vertical" className="h-20" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h2>X Post Positif</h2>
                <BadgePlus size={14} />
              </div>
              <h1 className="text-lg font-semibold">{isPending ? <MoreHorizontal className="animate-pulse" /> : positivePost}</h1>
            </div>
            <Separator orientation="vertical" className="h-20" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h2>X Post Negatif</h2>
                <BadgeMinus size={14} />
              </div>
              <h1 className="text-lg font-semibold">{isPending ? <MoreHorizontal className="animate-pulse" /> : negativePost}</h1>
            </div>
          </div>
          {/* <div className="grid md:grid-cols-4 gap-2">
            <div className="flex flex-col p-3 border rounded">
              <h2>Total</h2>
              <h1>1000</h1>
            </div>
            <div className="flex flex-col p-3 border rounded">
              <h2>Total</h2>
              <h1>1000</h1>
            </div>
            <div className="flex flex-col p-3 border rounded">
              <h2>Total</h2>
              <h1>1000</h1>
            </div>
            <div className="flex flex-col p-3 border rounded">
              <h2>Total</h2>
              <h1>1000</h1>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </section>
  )
}
