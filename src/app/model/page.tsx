'use client'

import { evaluating, oversampling, preprocessing, vectoring } from '@/actions/analysis'
import { destroyMany, index, indexRandom, storeMany } from '@/actions/functions'
import { AppTable } from '@/components/app-table'
import FormSettings from '@/components/form-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ColumnDef } from '@tanstack/react-table'

import { ChevronRight, FilePlus2, Loader2, RefreshCw, ReplaceAll, Save, ScanText, Target } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const columnsData: ColumnDef<Preprocessed>[] = [
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

const columnsVectors: ColumnDef<Vector>[] = [
  {
    accessorKey: 'feature',
    header: 'Fitur',
    cell: ({ row }) => row.original.feature.join(', '),
  },
  {
    accessorKey: 'label',
    header: 'Label',
  },
]

export default function Page() {
  const [data, setData] = useState<Preprocessed[]>([])
  const [vectors, setVectors] = useState<Vector[]>([])
  const [result, setResult] = useState<Analysis>({ accuracy: '0', precision: '0', recall: '0', f1_score: '0', confusion_matrix: { tp: 0, tn: 0, fp: 0, fn: 0 } })
  const [isPendingData, setTransitionData] = useTransition()
  const [isPendingVectors, setTransitionVectors] = useTransition()
  const [isPendingOversampling, setTransitionOversampling] = useTransition()
  const [isPendingResult, setTransitionResult] = useTransition()
  const [isPendingSave, setTransitionSave] = useTransition()

  const handlePreprocessing = () => {
    setTransitionData(async () => {
      const start = performance.now()
      const settings = await index('main', 'settings')
      const dataset = await indexRandom('main', 'dataset', parseInt(settings[0]?.dataset_size))
      setData(await preprocessing(dataset))
      const end = performance.now()
      toast.success(`Data berhasil diproses (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleVectoring = () => {
    setTransitionVectors(async () => {
      const start = performance.now()
      const settings = await index('main', 'settings')
      setVectors(await vectoring(data, settings[0]?.max_features))
      const end = performance.now()
      toast.success(`Vektor berhasil diekstraksi (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleOversampling = () => {
    setTransitionOversampling(async () => {
      const start = performance.now()
      const settings = await index('main', 'settings')
      setVectors(await oversampling(vectors, settings[0]?.oversampling))
      const end = performance.now()
      toast.success(`Data berhasil di-over sampling (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleEvaluating = () => {
    setTransitionResult(async () => {
      const start = performance.now()
      const settings = await index('main', 'settings')
      setResult(
        await evaluating(vectors, {
          test_size: parseFloat(settings[0]?.test_size),
          n_estimators: parseInt(settings[0]?.n_estimators),
          tree_depth: parseInt(settings[0]?.tree_depth),
        })
      )
      const end = performance.now()
      toast.success(`Model berhasil dievaluasi (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleSave = () => {
    setTransitionSave(async () => {
      const start = performance.now()
      await destroyMany('main', 'model')
      await storeMany('main', 'model', vectors)
      const end = performance.now()
      toast.success(`Model berhasil disimpan (${((end - start) / 1000).toFixed(2)}s)`)
    })
  }

  const handleReset = () => {
    setData([])
    setVectors([])
    setResult({ accuracy: '0', precision: '0', recall: '0', f1_score: '0', confusion_matrix: { tp: 0, tn: 0, fp: 0, fn: 0 } })
    toast.success('Data berhasil direset')
  }

  return (
    <div className="grid gap-2">
      <Card className="rounded">
        <CardHeader>
          <CardTitle>Evaluasi Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 justify-between ">
            <div>
              <Button size={'sm'} variant={data.length > 0 ? 'outline' : 'ghost'} onClick={handlePreprocessing} disabled={isPendingData}>
                {isPendingData ? <Loader2 className="animate-spin" /> : <ScanText />}
                Text Preprocessing
              </Button>

              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>
              <Button size={'sm'} variant={vectors.length > 0 ? 'outline' : 'ghost'} onClick={handleVectoring} disabled={data.length < 1 || isPendingVectors}>
                {isPendingVectors ? <Loader2 className="animate-spin" /> : <ReplaceAll />}
                Ekstraksi Fitur (TF-IDF)
              </Button>
              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={data.length !== vectors.length ? 'outline' : 'ghost'} onClick={handleOversampling} disabled={vectors.length < 1 || isPendingOversampling}>
                {isPendingOversampling ? <Loader2 className="animate-spin" /> : <FilePlus2 />}
                Over Sampling
              </Button>
              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={result.accuracy !== '0' ? 'outline' : 'ghost'} onClick={handleEvaluating} disabled={vectors.length < 1 || isPendingResult}>
                {isPendingResult ? <Loader2 className="animate-spin" /> : <Target />}
                Random Forest
              </Button>
              <Button size={'sm'} variant={'ghost'} disabled>
                <ChevronRight />
              </Button>

              <Button size={'sm'} variant={'ghost'} onClick={handleSave} disabled={result.accuracy === '0'}>
                {isPendingSave ? <Loader2 className="animate-spin" /> : <Save />}
                Save Model
              </Button>
            </div>
            <div className="flex gap-2">
              <FormSettings />
              <Button size={'icon'} variant={'outline'} onClick={handleReset}>
                <RefreshCw />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-2">
        <Card className="rounded">
          <CardHeader>
            <CardTitle>Evaluasi</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 justify-between">
            <div>
              <h1 className="text-sm">Confusion Matrix</h1>
              <table cellPadding={5} cellSpacing={0} className="border">
                <tbody>
                  <tr>
                    <td></td>
                    <td align="center">Positif</td>
                    <td align="center">Negatif</td>
                  </tr>
                  <tr>
                    <td>Positif</td>
                    <td align="center">{result.confusion_matrix.tp}</td>
                    <td align="center">{result.confusion_matrix.fp}</td>
                  </tr>
                  <tr>
                    <td>Negatif</td>
                    <td align="center">{result.confusion_matrix.fn}</td>
                    <td align="center">{result.confusion_matrix.tn}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-semibold">{result.accuracy}%</h1>
              <h1 className="italic">Accuracy</h1>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-semibold">{result.precision}%</h1>
              <h1 className="italic">Precision</h1>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-semibold">{result.recall}%</h1>
              <h1 className="italic">Recall</h1>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-semibold">{result.f1_score}%</h1>
              <h1 className="italic">F1 Score</h1>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded">
          <CardHeader>
            <CardTitle>Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <AppTable columns={columnsData} data={data} />
          </CardContent>
        </Card>
        <Card className="rounded">
          <CardHeader>
            <CardTitle>TF-IDF</CardTitle>
          </CardHeader>
          <CardContent>
            <AppTable columns={columnsVectors} data={vectors} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
