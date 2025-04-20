'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRefresh } from '@/hooks/use-refresh'
import { Loader2, Save } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import csv from 'csvtojson'
import { convertToISOString, getProvince } from '@/lib/utils'
import { storeMany } from '@/actions/functions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  file: z.any(),
  location: z.string(),
})

export default function Page() {
  const { refresh } = useRefresh()
  const [isPending, setTransition] = useTransition()
  const [data, setData] = useState<{ text: string; location: string; date: string; url: string; username: string }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: '',
      location: '',
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setTransition(async () => {
        await storeMany('main', 'post', data)
        toast.success(`Successfully upload data from file ${values.file}`)
        setTransition(refresh)
      })
    } catch (error) {
      console.log(error)
    }
  }

  // eslint-disable-next-line
  function handleChangeFile(event: any) {
    const file = event.target.files[0]
    const reader = new FileReader()

    // eslint-disable-next-line
    reader.onload = (e: any) => {
      const text = e.target.result
      setTransition(async () => {
        const json = await csv({ delimiter: ',', headers: ['', 'date', '', 'text', '', '', '', '', '', '', '', '', 'url', '', 'username'] }).fromString(text)

        const result = json.map(({ text, date, url, username }) => {
          date = convertToISOString(date)
          return { text, location: '', date, url, username }
        })
        setData(result)
      })
    }
    reader.readAsText(file)
  }

  // eslint-disable-next-line
  function handleChangeLocation(event: any) {
    const result = data.map(({ text, date, url, username }) => {
      return { text, location: event, date, url, username }
    })
    setData(result)
  }

  return (
    <div className="space-y-4">
      <Card className="rounded">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} onChangeCapture={handleChangeFile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Select onValueChange={handleChangeLocation} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getProvince().map(({ code, province }) => (
                            <SelectItem key={code} value={province.toLowerCase().replace(/\s/g, '-')}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Save
                <Save />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* {data.length > 0 && (
        <div className="max-w-prose">
          <pre className="overflow-auto">
            <code>{JSON.stringify(data.slice(0, 3), null, 2)}</code>
            ... {data.length - 3} more data
          </pre>
        </div>
      )} */}
    </div>
  )
}
