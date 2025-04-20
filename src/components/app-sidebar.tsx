'use client'

import { CircuitBoard, Combine, Database, Home, Loader2, Twitter } from 'lucide-react'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { count } from '@/actions/functions'
import { useRefresh } from '@/hooks/use-refresh'

export function AppSidebar() {
  const pathName = usePathname()
  const { watch } = useRefresh()
  const [isPending, setTransition] = useTransition()
  const [data, setData] = useState([
    {
      title: 'Dataset',
      url: '/dataset',
      icon: Database,
      badge: 0,
    },
    {
      title: 'X Posts',
      url: '/posts',
      icon: Twitter,
      badge: 0,
    },
  ])

  useEffect(() => {
    setTransition(async () => {
      setData([
        {
          title: 'Dataset',
          url: '/dataset',
          icon: Database,
          badge: (await count('main', 'dataset')) ?? 0,
        },
        {
          title: 'X Post',
          url: '/post',
          icon: Twitter,
          badge: (await count('main', 'post')) ?? 0,
        },
      ])
    })
  }, [watch])

  const dashboard = [
    {
      title: 'Beranda',
      url: '/',
      icon: Home,
    },
  ]

  const process = [
    {
      title: 'Evaluasi Model',
      url: '/model',
      icon: CircuitBoard,
    },
    {
      title: 'Klasifikasi Data',
      url: '/classification',
      icon: Combine,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center">
            <h1 className="font-bold">SIGAS UNSOED</h1>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboard.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathName === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data?.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild isActive={pathName.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{isPending ? <Loader2 size={14} className="animate-spin" /> : <>{item.badge}</>}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Proses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {process.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathName === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
