'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export function BarChart({ data }: { data: ChartProps }) {
  return (
    <Bar
      data={{
        labels: data.labels,
        datasets: data.datasets,
      }}
    />
  )
}

export function LineChart({ data }: { data: ChartProps }) {
  return (
    <Line
      data={{
        labels: data.labels,
        datasets: data.datasets,
      }}
    />
  )
}
