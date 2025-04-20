'use client'

import { index } from '@/actions/functions'
import { chat } from '@/actions/result'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocation } from '@/hooks/use-location'
import { groupByWeeks } from '@/lib/utils'
import { useEffect, useState, useTransition } from 'react'
import parse from 'html-react-parser'
import { preprocessing } from '@/actions/classify'
import { AppTable } from '@/components/app-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<{ text: string; date: string; sentiment: string; url: string; username: string }>[] = [
  {
    accessorKey: 'text',
    header: 'Teks',
    cell: ({ row }) => (
      <a href={row.original.url} target="blank" className={row.original.sentiment === 'positive' ? 'text-green-500' : row.original.sentiment === 'negative' ? 'text-red-500' : ''}>
        {row.original.text}
      </a>
    ),
  },
  {
    accessorKey: 'date',
    sortingFn: 'datetime',
    header: 'Tanggal',
    cell: ({ row }) => new Date(row.original.date).toLocaleString('en-us'),
  },
]

export default function Page() {
  const { province } = useLocation()
  const [isPending, setTransition] = useTransition()
  const [output, setOutput] = useState<string>('')
  const [post, setPost] = useState<{ text: string; date: string; sentiment: string; url: string; username: string }[]>([])

  useEffect(() => {
    setTransition(async () => {
      const { labels, datasets } = groupByWeeks(await index('main', 'post', { location: province }))
      const corpus = await index('main', 'post', { location: province })
      setPost(corpus)
      const texts = await preprocessing(corpus)
      if (labels.length > 0 && datasets.length > 0) {
        setOutput(
          await chat(
            `Dalam konteks sistem informasi geografis dan analisis sentimen, dengan topik 'kebijakan makan bergizi gratis oleh pemerintah Indonesia' pada provinsi ${province} terdapat ${JSON.stringify(
              labels
            )} minggu yang terdapat ${JSON.stringify(datasets.map((data) => data.length))} data post. Dari data tersebut, terdapat ${JSON.stringify(
              datasets.map((data) => data.filter((item) => item.sentiment === 'positive').length)
            )} data post yang bersentimen positif dan ${JSON.stringify(
              datasets.map((data) => data.filter((item) => item.sentiment === 'negative').length)
            )} data post yang bersentimen negatif. Dari data tersebut, berikut adalah dokumen x postnya ${JSON.stringify(
              texts.map(({ stopword }: { stopword: string }) => stopword)
            )} berikan kata-kata kunci yang mempengaruhi sentimen. Berikan kesimpulan dari data tersebut. 
            
            Tuliskan dalam bentuk (untuk tabel gunakan tag <table classname="border w-full">, untuk header gunakan tag <h1 classname="font-bold text-xl", untuk sub header gunakan tag <h2 classname="font-semibold text-lg">, untuk paragraf gunakan tag <p classname="text-justify">, untuk spasi gunakan <br>, untuk list gunakan <ul> dan <li classname="text-justify"> dan bungkus semua tag tersebut kedalam tag <div classname="space-y-2">) tanpa perlu dijelaskan.`
          )
        )
      } else {
        setOutput('Tidak dapat menyimpulkan')
      }
    })
  }, [province])

  return (
    <div className="grid gap-2">
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Data X Post</CardTitle>
        </CardHeader>
        <CardContent>
          <AppTable columns={columns} data={post} />
        </CardContent>
      </Card>
      <Card className="rounded ">
        <CardHeader>
          <CardTitle>Kesimpulan</CardTitle>
        </CardHeader>
        <CardContent>{isPending ? <span className="animate-pulse">Memproses...</span> : parse(output)}</CardContent>
      </Card>
    </div>
  )
}
