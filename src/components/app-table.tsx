'use client'

import { ColumnDef, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download } from 'lucide-react'
import CsvDownloader from 'react-csv-downloader'
import { usePathname } from 'next/navigation'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function AppTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const pathName = usePathname()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div
      className="rounded border p-2 overflow-auto
    "
    >
      <div className="flex items-center justify-between py-2 px-1">
        <Input placeholder="Search" value={globalFilter ?? ''} onChange={(e) => table.setGlobalFilter(String(e.target.value))} className="w-1/3" id="filter" name="filter" />
        <CsvDownloader filename={pathName} datas={data as []} separator=";">
          <Button variant="ghost" size="sm">
            <Download />
            Download
          </Button>
        </CsvDownloader>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2 py-2 overflow-visible">
        <div className="flex-1 text-sm text-muted-foreground">{table.getRowCount()} row(s).</div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value: string) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
