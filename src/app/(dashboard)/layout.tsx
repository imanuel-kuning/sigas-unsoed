export default function Layout({ children, map, chart, ai }: { children: React.ReactNode; map: React.ReactNode; chart: React.ReactNode; ai: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <div>{children}</div>
      <div>{map}</div>
      <div>{chart}</div>
      <div>{ai}</div>
    </section>
  )
}
