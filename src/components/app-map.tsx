'use client'

import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'
import indonesia from '@/lib/indonesia.json'

import { GeoJsonObject } from 'geojson'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useLocation } from '@/hooks/use-location'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Map, MapPlus } from 'lucide-react'
import { getProvince } from '@/lib/utils'
import { useState } from 'react'
import { Button } from './ui/button'

export default function AppMap({ data, width = 'auto', height = '80vh', center = [-2.5, 120], zoom = 5 }: { data: GroupedResult[]; width: string; height: string; center: [number, number]; zoom: number }) {
  const { province, currentLocation } = useLocation()
  const [change, setChange] = useState<string>('default')

  indonesia.features.forEach((feature: { properties: { KDPPUM: string; WADMPR: string; METADATA: string; UPDATED: string; positive?: number; negative?: number; ratio?: number } }) => {
    data.forEach((post) => {
      if (feature.properties.WADMPR.toLowerCase().replace(/\s/g, '-') === post.location) {
        feature.properties.positive = post.positive
        feature.properties.negative = post.negative
      }
    })
  })

  function style(feature: FeatureProps['feature']) {
    function getColor(properties: FeatureProps['feature']['properties']) {
      const total = properties.positive + properties.negative

      if (change === 'heatmap') {
        if (total <= 50 && total > 0) {
          return '#facc15'
        }
        if (total <= 100) {
          return '#f59e0b'
        }
        if (total <= 150) {
          return '#f97316'
        }
        if (total <= 200) {
          return '#c2410c'
        }
        if (total > 200) {
          return '#ef4444'
        }
        return 'black'
      }

      if (change === 'positive') {
        const ratio = properties.positive / total
        if (ratio <= 0.5 && ratio > 0) {
          return '#86efac'
        }
        if (ratio <= 0.75) {
          return '#22c55e'
        }
        if (ratio <= 1) {
          return '#16a34a'
        }
        if (ratio <= 1.5) {
          return '#166534'
        }
        if (ratio > 1.5) {
          return '#052e16'
        }
        return 'black'
      }

      if (change === 'negative') {
        const ratio = properties.negative / total
        if (ratio <= 0.5 && ratio > 0) {
          return '#fca5a5'
        }
        if (ratio <= 0.75) {
          return '#ef4444'
        }
        if (ratio <= 1) {
          return '#b91c1c'
        }
        if (ratio <= 1.5) {
          return '#991b1b'
        }
        if (ratio > 1.5) {
          return '#450a0a'
        }
        return 'black'
      }

      if (properties.positive > properties.negative) {
        const ratio = properties.positive / total
        if (ratio < 0.67) {
          return '#34D399'
        } else if (ratio < 78) {
          return '#10B981'
        } else {
          return '#059669'
        }
      }

      if (properties.positive < properties.negative) {
        const ratio = properties.negative / total
        if (ratio < 0.67) {
          return '#F87171'
        } else if (ratio < 78) {
          return '#EF4444'
        } else {
          return '#DC2626'
        }
      }

      if (properties.positive == properties.negative && total > 0) {
        return 'white'
      }
      return 'black'
    }

    function getCurrent(properties: FeatureProps['feature']['properties']) {
      if (properties.WADMPR.toLowerCase().replace(/\s/g, '-') === province) {
        return 3
      }
      return 1
    }

    return {
      fillColor: getColor(feature.properties),
      weight: getCurrent(feature.properties),
      opacity: 1,
      color: 'gray',
      fillOpacity: 0.5,
    }
  }

  function onEachFeature(feature: FeatureProps['feature'], layer: FeatureProps['layer']) {
    function onClick() {
      const province = feature.properties.WADMPR.toLowerCase().replace(/\s/g, '-')
      currentLocation(province)
    }

    function onMouseOver() {
      layer.setStyle({
        fillOpacity: 0.7,
      })
    }

    function onMouseOut() {
      layer.setStyle({
        fillOpacity: 0.5,
      })
    }

    layer.on({
      click: onClick,
      mouseover: onMouseOver,
      mouseout: onMouseOut,
    })
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        <Select onValueChange={(value) => currentLocation(value)} defaultValue={province} value={province}>
          <SelectTrigger>
            <Map size={17} />
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {getProvince().map(({ code, province }) => (
              <SelectItem key={code} value={province.toLowerCase().replace(/\s/g, '-')}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setChange(value)} defaultValue={change} value={change}>
          <SelectTrigger>
            <MapPlus size={17} />
            <SelectValue placeholder="Map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="heatmap">Heatmap</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MapContainer className="rounded mt-2" style={{ width, height, zIndex: 0 }} center={center} zoom={zoom} maxZoom={8} minZoom={4}>
        <TileLayer attribution="©OpenStreetMap, ©CartoDB" url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png" />
        <GeoJSON style={style} data={indonesia as GeoJsonObject} onEachFeature={onEachFeature} />
        <div className="leaflet-top leaflet-right m-2 bg-slate-50 text-black rounded-sm p-2">
          <h1 className="font-bold capitalize">{province.replaceAll('-', ' ')}</h1>
        </div>

        <div className="leaflet-bottom leaflet-left m-2 bg-slate-50 text-black rounded-sm p-1">
          {change === 'heatmap' && (
            <>
              <h1>Total</h1>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-black"></div>
                <div>{'0'}</div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-400"></div>
                <div>{'<=50'}</div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-amber-500"></div>
                <div>{'<=100'}</div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-500"></div>
                <div>{'<=150'}</div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-700"></div>
                <div>{'<=200'}</div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500"></div>
                <div>{'>200'}</div>
              </div>
            </>
          )}
        </div>
      </MapContainer>
    </>
  )
}
