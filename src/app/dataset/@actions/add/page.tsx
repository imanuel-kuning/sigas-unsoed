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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { store } from '@/actions/functions'

const formSchema = z.object({
  text: z.string().nonempty(),
  sentiment: z.string().nonempty(),
})

export default function Page() {
  const { refresh } = useRefresh()
  const [isPending, setTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      sentiment: '',
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const res = await store('main', 'dataset', values)
      toast.success(res?.message)
      setTransition(refresh)
    })
  }

  return (
    <Card className="rounded">
      <CardHeader>
        <CardTitle>Tambah Dataset</CardTitle>
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
              name="sentiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sentiment</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
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
  )
}
