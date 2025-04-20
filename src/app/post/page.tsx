'use client'

import { destroy, index } from '@/actions/functions'
import { AppTable } from '@/components/app-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useRefresh } from '@/hooks/use-refresh'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useTemporary } from '@/hooks/use-temporary'
import { redirect } from 'next/navigation'
import { PenBox, Trash2 } from 'lucide-react'
import { AppTableSort } from '@/components/app-table-sort'

export default function Page() {
  const [data, setData] = useState<Post[]>([])
  const [isPending, setTransition] = useTransition()
  const { watch, refresh } = useRefresh()
  const { temp, setTemp } = useTemporary()

  const columns: ColumnDef<Post>[] = [
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
      sortingFn: 'datetime',
      header: 'Tanggal',
      cell: ({ row }) => new Date(row.original.date).toLocaleString('en-us'),
    },
    {
      accessorKey: 'sentiment',
      header: ({ column }) => <AppTableSort column={column} title="Sentiment" />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const id = row.original._id
        return (
          <div className="flex-1 justify-end">
            <Button
              variant={temp._id === id ? 'outline' : 'ghost'}
              size={'sm'}
              disabled={isPending}
              className="w-full"
              onClick={() => {
                setTemp(row.original)
                redirect('/post/edit')
              }}
            >
              <PenBox />
              Ubah Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={'ghost'} size={'sm'} disabled={isPending} className="w-full">
                  <Trash2 />
                  Hapus Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>{`Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus data "${id}" dari server.`}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setTransition(async () => {
                        const res = await destroy('main', 'post', id)
                        toast.success(res?.message)
                        setTransition(refresh)
                      })
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    setTransition(async () => {
      setData(await index('main', 'post'))
    })
  }, [watch])

  return (
    <Card className="rounded">
      <CardHeader>
        <CardTitle>Post</CardTitle>
      </CardHeader>
      <CardContent>
        <AppTable columns={columns} data={data} />
      </CardContent>
    </Card>
  )
}
