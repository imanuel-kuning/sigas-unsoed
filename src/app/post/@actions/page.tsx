import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, PlusSquare } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <Card className="rounded">
      <CardHeader>
        <CardTitle>Aksi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Link href="/post/add">
            <Button variant={'ghost'} size={'sm'} className="w-full">
              <PlusSquare /> Tambah Data
            </Button>
          </Link>
          <Link href="/post/upload">
            <Button variant={'ghost'} size={'sm'} className="w-full">
              <PlusCircle /> Upload File .csv
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
