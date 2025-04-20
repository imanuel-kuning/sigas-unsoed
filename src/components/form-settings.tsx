import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Loader2, Save, Settings2 } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useTransition } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { destroyMany, index, store } from '@/actions/functions'
import { useRefresh } from '@/hooks/use-refresh'

const formSchema = z.object({
  dataset_size: z.string().nonempty(),
  max_features: z.string().nonempty(),
  oversampling: z.string().nonempty(),
  test_size: z.string().nonempty(),
  n_estimators: z.string().nonempty(),
  tree_depth: z.string().nonempty(),
})

export default function FormSettings() {
  const { refresh } = useRefresh()
  const [isPending, setTransition] = useTransition()
  const [data, setData] = useState<Settings>()

  useEffect(() => {
    setTransition(async () => {
      const settings = await index('main', 'settings')
      setData(settings[0])
      setTransition(refresh)
    })
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataset_size: data?.dataset_size as string,
      max_features: data?.max_features as string,
      oversampling: data?.oversampling as string,
      test_size: data?.test_size as string,
      n_estimators: data?.n_estimators as string,
      tree_depth: data?.tree_depth as string,
    },
    values: {
      dataset_size: data?.dataset_size as string,
      max_features: data?.max_features as string,
      oversampling: data?.oversampling as string,
      test_size: data?.test_size as string,
      n_estimators: data?.n_estimators as string,
      tree_depth: data?.tree_depth as string,
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const [x, res] = await Promise.all([destroyMany('main', 'settings'), store('main', 'settings', values)])
      if (x) toast.success(res?.message)
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={'icon'} variant={'outline'} disabled={isPending}>
          <Settings2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pengaturan</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="dataset_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dataset Size</FormLabel>
                    <FormControl>
                      <Input {...field} min={10} max={1000} type="number" placeholder="Dataset Size" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Features</FormLabel>
                    <FormControl>
                      <Input {...field} min={5} max={100} type="number" placeholder="Max Features" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oversampling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oversampling</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="random">Random Over Sampling</SelectItem>
                          <SelectItem value="smote">SMOTE Over Sampling</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="test_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Size</FormLabel>
                    <FormControl>
                      <Input {...field} min={0.1} max={0.9} type="number" step={0.1} placeholder="Test Size" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="n_estimators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N Estimators</FormLabel>
                    <FormControl>
                      <Input {...field} min={10} max={300} type="number" placeholder="N Estimators" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tree_depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree Depth</FormLabel>
                    <FormControl>
                      <Input {...field} min={2} max={20} type="number" placeholder="Tree Depth" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Save
                <Save />
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
