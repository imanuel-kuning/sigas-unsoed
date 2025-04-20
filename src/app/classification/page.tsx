'use client'

import { classifying, preprocessing, saving, vectoring } from '@/actions/classify'
import { index } from '@/actions/functions'
import { AppTable } from '@/components/app-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProvince } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ChevronRight, Loader2, Map, ReplaceAll, Save, ScanText, Target } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

const columnsData: ColumnDef<Post>[] = [
  {
    accessorKey: 'text',
    header: 'Teks',
  },
  {
    accessorKey: 'location',
    header: 'Provinsi',
  },
  {
    accessorKey: 'date',
    header: 'Tanggal',
  },
  {
    accessorKey: 'sentiment',
    header: 'Sentimen',
  },
]

const columnsPreprocess: ColumnDef<Post>[] = [
  {
    accessorKey: 'text',
    header: 'Teks',
  },
  {
    accessorKey: 'clean',
    header: 'Cleaning',
  },
  {
    accessorKey: 'stem',
    header: 'Stemming',
  },
  {
    accessorKey: 'stopword',
    header: 'Stopword Removal',
  },
]

const columnsVectors: ColumnDef<{ _id: string; feature: number[] }>[] = [
  {
    accessorKey: 'feature',
    header: 'Fitur',
    cell: ({ row }) => row.original.feature.join(', '),
  },
]

export default function Page() {
  const [isPending, setTransition] = useTransition()
  const [isPendingLocation, setTransitionLocation] = useTransition()
  const [isPendingData, setTransitionData] = useTransition()
  const [isPendingVectors, setTransitionVectors] = useTransition()
  const [isPendingClassification, setTransitionClassification] = useTransition()
  const [isPendingSave, setTransitionSave] = useTransition()
  const [model, setModel] = useState<Vector[]>([])
  const [vectors, setVectors] = useState<{ _id: string; feature: number[] }[]>([])
  const [data, setData] = useState<Post[]>([])
  const [preprocess, setPreprocess] = useState<Preprocessed[]>([])
  const [predictions, setPredictions] = useState<{ _id: string; feature: number[]; label: number }[]>([])

  useEffect(() => {
    setTransition(async () => {
      setModel(await index('main', 'model'))
    })
  }, [])

  const handleLocationChange = (value: string) => {
    setTransitionLocation(async () => {
      const start = performance.now()
      setData(await index('main', 'post', { location: value }))
      const end = performance.now()
      toast.success(`Data berhasil dimuat (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handlePreprocessing = () => {
    setTransitionData(async () => {
      const start = performance.now()
      setPreprocess(await preprocessing(data))
      const end = performance.now()
      toast.success(`Data berhasil diproses (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleVectoring = () => {
    setTransitionVectors(async () => {
      const start = performance.now()
      const dataset = await index('main', 'dataset')
      const settings = await index('main', 'settings')
      const corpus = dataset.map(({ text }: { text: string }) => text)
      setVectors(await vectoring(preprocess, corpus, settings[0]?.max_features))
      const end = performance.now()
      toast.success(`Vektor berhasil diekstraksi (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleClassification = () => {
    setTransitionClassification(async () => {
      const start = performance.now()
      const settings = await index('main', 'settings')
      const result = await classifying(vectors, model, { n_estimators: parseInt(settings[0]?.n_estimators), tree_depth: parseInt(settings[0]?.tree_depth) })
      setPredictions(result)
      setData(
        data.map((e, i) => {
          return { ...e, sentiment: result[i].label === 1 ? 'positive' : 'negative' }
        })
      )
      const end = performance.now()
      toast.success(`Data berhasil diklasifikasi (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleSave = () => {
    setTransitionSave(async () => {
      const start = performance.now()
      await saving(data)
      // await Promise.all(data.map((e) => update('main', 'post', e._id, { sentiment: e.sentiment })))
      const end = performance.now()
      toast.success(`Data berhasil diupdate (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  return (
    <div className="grid gap-2">
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Klasifikasi Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full mb-3">
            <Select onValueChange={handleLocationChange} disabled={model.length === 0}>
              <SelectTrigger className="flex gap-2">
                {isPendingLocation || isPending ? <Loader2 className="animate-spin" size={17} /> : <Map size={17} />}
                <SelectValue placeholder="Pilih Provinsi" />
              </SelectTrigger>
              <SelectContent>
                {getProvince().map(({ code, province }) => (
                  <SelectItem key={code} value={province.toLowerCase().replace(/\s/g, '-')}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center w-full">
              <Button size={'sm'} variant={preprocess.length > 0 ? 'outline' : 'ghost'} disabled={isPendingData || data.length < 1} onClick={handlePreprocessing}>
                {isPendingData ? <Loader2 className="animate-spin" /> : <ScanText />}
                Text Preprocessing
              </Button>

              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={vectors.length > 0 ? 'outline' : 'ghost'} disabled={preprocess.length < 1 || isPendingVectors} onClick={handleVectoring}>
                {isPendingVectors ? <Loader2 className="animate-spin" /> : <ReplaceAll />}
                Ekstraksi Fitur (TF-IDF)
              </Button>

              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={predictions.length > 0 ? 'outline' : 'ghost'} disabled={vectors.length < 1} onClick={handleClassification}>
                {isPendingClassification ? <Loader2 className="animate-spin" /> : <Target />}
                Klasifikasi Data
              </Button>

              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={'ghost'} onClick={handleSave} disabled={predictions.length < 1}>
                {isPendingSave ? <Loader2 className="animate-spin" /> : <Save />}
                Update X Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded">
        <CardHeader>
          <CardTitle>X Post</CardTitle>
        </CardHeader>
        <CardContent>
          <AppTable columns={columnsData} data={data} />
        </CardContent>
      </Card>

      <Card className="rounded">
        <CardHeader>
          <CardTitle>Preprocess</CardTitle>
        </CardHeader>
        <CardContent>
          <AppTable columns={columnsPreprocess} data={preprocess} />
        </CardContent>
      </Card>

      <Card className="rounded">
        <CardHeader>
          <CardTitle>Vectors</CardTitle>
        </CardHeader>
        <CardContent>
          <AppTable columns={columnsVectors} data={vectors} />
        </CardContent>
      </Card>
    </div>
  )
}
