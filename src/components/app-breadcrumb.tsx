'use client'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

export default function AppBreadcrumb() {
  const path = usePathname().split('/').filter(Boolean)

  const links = path.map((item, index) => {
    return {
      label: item,
      href: `/${path.slice(0, index + 1).join('/')}`,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map(({ label, href }, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              {links.length == index + 1 ? (
                <BreadcrumbPage className="capitalize">
                  <h2>{label}</h2>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink className="capitalize" asChild>
                  <Link href={href}>
                    <h2>{label}</h2>
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {links.length - 1 !== index && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
