'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRefresh } from '@/hooks/use-refresh'
import { Loader2, Save } from 'lucide-react'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { getProvince } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { store } from '@/actions/functions'

const formSchema = z.object({
  text: z.string().nonempty(),
  location: z.string().nonempty(),
  date: z.string().nonempty(),
})

export default function Page() {
  const { refresh } = useRefresh()
  const [isPending, setTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      location: '',
      date: '',
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const res = await store('main', 'post', values)
      toast.success(res?.message)
      setTransition(refresh)
    })
  }

  return (
    <Card className="rounded">
      <CardHeader>
        <CardTitle>Tambah Data Post</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full Text" className="resize-none" rows={5} {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
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
  )
}
