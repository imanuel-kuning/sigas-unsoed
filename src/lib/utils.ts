import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProvince(): { code: string; province: string }[] {
  return [
    {
      code: '11',
      province: 'Aceh',
    },
    {
      code: '12',
      province: 'Sumatera Utara',
    },
    {
      code: '13',
      province: 'Sumatera Barat',
    },
    {
      code: '14',
      province: 'Riau',
    },
    {
      code: '15',
      province: 'Jambi',
    },
    {
      code: '16',
      province: 'Sumatera Selatan',
    },
    {
      code: '17',
      province: 'Bengkulu',
    },
    {
      code: '18',
      province: 'Lampung',
    },
    {
      code: '19',
      province: 'Kepulauan Bangka Belitung',
    },
    {
      code: '21',
      province: 'Kepulauan Riau',
    },
    {
      code: '31',
      province: 'DKI Jakarta',
    },
    {
      code: '32',
      province: 'Jawa Barat',
    },
    {
      code: '33',
      province: 'Jawa Tengah',
    },
    {
      code: '34',
      province: 'Daerah Istimewa Yogyakarta',
    },
    {
      code: '35',
      province: 'Jawa Timur',
    },
    {
      code: '36',
      province: 'Banten',
    },
    {
      code: '51',
      province: 'Bali',
    },
    {
      code: '52',
      province: 'Nusa Tenggara Barat',
    },
    {
      code: '53',
      province: 'Nusa Tenggara Timur',
    },
    {
      code: '61',
      province: 'Kalimantan Barat',
    },
    {
      code: '62',
      province: 'Kalimantan Tengah',
    },
    {
      code: '63',
      province: 'Kalimantan Selatan',
    },
    {
      code: '64',
      province: 'Kalimantan Timur',
    },
    {
      code: '65',
      province: 'Kalimantan Utara',
    },
    {
      code: '71',
      province: 'Sulawesi Utara',
    },
    {
      code: '72',
      province: 'Sulawesi Tengah',
    },
    {
      code: '73',
      province: 'Sulawesi Selatan',
    },
    {
      code: '74',
      province: 'Sulawesi Tenggara',
    },
    {
      code: '75',
      province: 'Gorontalo',
    },
    {
      code: '76',
      province: 'Sulawesi Barat',
    },
    {
      code: '81',
      province: 'Maluku',
    },
    {
      code: '82',
      province: 'Maluku Utara',
    },
    {
      code: '91',
      province: 'Papua',
    },
    {
      code: '92',
      province: 'Papua Barat',
    },
    {
      code: '96',
      province: 'Papua Barat Daya',
    },
    {
      code: '93',
      province: 'Papua Selatan',
    },
    {
      code: '94',
      province: 'Papua Tengah',
    },
    {
      code: '95',
      province: 'Papua Pegunungan',
    },
  ]
}

export function convertToISOString(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().slice(0, 16)
}

export function groupLocationSentiment(data: Post[]) {
  // Initialize an object to store the grouped data
  const groupedData: Record<string, GroupedResult> = {}

  // Iterate through the data
  data.forEach((item: Post) => {
    const location = item.location
    const sentiment = item.sentiment

    // Initialize the location entry if it doesn't exist
    if (!groupedData[location]) {
      groupedData[location] = {
        location: location,
        positive: 0,
        negative: 0,
      }
    }

    // Increment the respective sentiment count
    if (sentiment === 'positive') {
      groupedData[location].positive++
    } else if (sentiment === 'negative') {
      groupedData[location].negative++
    }
  })

  // Convert the grouped data object into an array
  const result: GroupedResult[] = Object.values(groupedData)

  return result
}

export function groupByWeeks(data: Post[]) {
  if (!data) {
    return { labels: [], datasets: [] }
  }
  // Sort the data by date first
  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const groupedData: Record<string, { week: string; data: { text: string; sentiment: string; date: string }[] }> = {}

  data.forEach((item) => {
    const date = new Date(item.date)
    const weekNumber = Math.ceil((date.getDate() - 1) / 7)
    const week = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-week${weekNumber < 1 ? 1 : weekNumber}`

    if (!groupedData[week]) {
      groupedData[week] = {
        week: week,
        data: [],
      }
    }

    groupedData[week].data.push(item)
  })

  const labels = Object.keys(groupedData).map((week) => {
    const [year, month, weekPart] = week.split('-')
    const weekNumber = weekPart.replace('week', '')
    return `M-${weekNumber}(${year}-${month})`
  })
  const datasets = Object.values(groupedData).map((group) => group.data)

  return { labels, datasets }
}
