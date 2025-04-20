import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Evaluasi Model',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}
