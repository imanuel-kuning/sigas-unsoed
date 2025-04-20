import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post',
}

export default function Layout({ children, actions }: { children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <section>
      <ResizablePanelGroup direction="horizontal" className="space-x-1">
        <ResizablePanel minSize={50} defaultSize={75}>
          {children}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={25}>{actions}</ResizablePanel>
      </ResizablePanelGroup>
    </section>
  )
}
