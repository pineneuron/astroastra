'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Event } from '@prisma/client'
import EventModal from './EventModal'
import { Plus, Search, MoreVertical, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Toast from '@radix-ui/react-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

type UIEvent = Event

const EVENT_TYPE_LABELS: Record<string, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  ONLINE: 'bg-blue-100 text-blue-700',
  OFFLINE: 'bg-amber-100 text-amber-700',
  HYBRID: 'bg-purple-100 text-purple-700',
}

type Props = {
  q: string
  events: UIEvent[]
  actions: {
    createEvent: (fd: FormData) => Promise<void>
    updateEvent: (fd: FormData) => Promise<void>
    deleteEvent: (fd: FormData) => Promise<void>
    toggleEventActive: (fd: FormData) => Promise<void>
  }
}

function formatSchedule(event: UIEvent): string {
  if (event.isOngoing) return 'Ongoing'
  if (!event.startDate) return '—'
  const d = new Date(event.startDate)
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  if (event.startTime && event.endTime) return `${event.startTime} – ${event.endTime}, ${dateStr}`
  if (event.startTime) return `${event.startTime}, ${dateStr}`
  return dateStr
}

export default function EventsClient({ q, events, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UIEvent | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UIEvent | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastError, setToastError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const openIfAdd = () => {
      if (window.location.hash === '#add') {
        setEditing(null)
        setOpen(true)
        history.replaceState(null, '', pathname)
      }
    }
    openIfAdd()
    window.addEventListener('hashchange', openIfAdd)
    return () => window.removeEventListener('hashchange', openIfAdd)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      try {
        const url = new URL(link.href, window.location.href)
        if (url.hash === '#add' && url.pathname === pathname) {
          e.preventDefault()
          setEditing(null)
          setOpen(true)
        }
      } catch { /* ignore */ }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])

  useEffect(() => {
    const m = searchParams.get('toast')
    if (m) {
      setToastMsg(decodeURIComponent(m))
      setToastError(false)
      setToastOpen(true)
      const url =
        pathname +
        '?' +
        Array.from(searchParams.entries())
          .filter(([k]) => k !== 'toast')
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join('&')
      router.replace(url || pathname)
    }
  }, [searchParams, pathname, router])

  const columns = useMemo<ColumnDef<UIEvent>[]>(
    () => [
      {
        id: 'image',
        header: () => <span className="text-sm">Image</span>,
        cell: ({ row }) => {
          const src = row.original.imageUrl || '/images/placeholder.png'
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="thumb" className="h-14 w-20 rounded-md object-cover" />
          )
        },
        size: 96,
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: () => <span className="text-sm">Title</span>,
        cell: ({ row }) => (
          <span className="text-[13px] font-medium text-gray-900">{row.original.title}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'type',
        header: () => <span className="text-sm">Type</span>,
        cell: ({ row }) => {
          const t = row.original.type
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${EVENT_TYPE_COLORS[t] ?? 'bg-gray-100 text-gray-700'}`}>
              {EVENT_TYPE_LABELS[t] ?? t}
            </span>
          )
        },
        size: 90,
        enableSorting: true,
      },
      {
        id: 'schedule',
        header: () => <span className="text-sm">Schedule</span>,
        cell: ({ row }) => (
          <span className="text-[12px] text-gray-600">{formatSchedule(row.original)}</span>
        ),
        size: 200,
        enableSorting: false,
      },
      {
        accessorKey: 'sortOrder',
        header: () => <span className="text-sm">Sort</span>,
        cell: ({ row }) => (
          <span className="text-[13px] font-medium text-gray-700">{row.original.sortOrder}</span>
        ),
        size: 70,
        enableSorting: true,
      },
    ],
    []
  )

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
  })

  if (!mounted) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Events</h1>
          <p className="text-[12px] text-gray-400">Manage events</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search events..."
              className="h-9 w-64 pl-8 pr-3 border border-[oklch(.922_0_0)] rounded-md text-sm"
            />
          </form>
          <button
            onClick={() => { setEditing(null); setOpen(true) }}
            className="h-9 px-3 rounded-md admin-btn-primary text-white text-[13px] font-semibold inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(.922_0_0)] bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const sorted = h.column.getIsSorted()
                  return (
                    <th key={h.id} className="px-3 py-2 select-none">
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 ${canSort ? 'hover:text-gray-900' : ''}`}
                          onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {canSort && (
                            sorted === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                            sorted === 'desc' ? <ChevronDown className="h-3 w-3" /> :
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      )}
                    </th>
                  )
                })}
                <th className="px-3 py-2 w-24 text-center">Featured</th>
                <th className="px-3 py-2 w-24">Active</th>
                <th className="px-3 py-2 w-48 text-right">Actions</th>
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[oklch(.922_0_0)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-[13px] text-gray-400">
                  No events found. Click &ldquo;Add New&rdquo; to create one.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const ev = row.original
                return (
                  <tr key={ev.id} className="border-b last:border-0 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3 text-[13px] align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      {ev.isFeatured
                        ? <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600 text-[11px] font-bold">✓</span>
                        : <span className="text-gray-300 text-[13px]">—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <form action={actions.toggleEventActive}>
                        <input type="hidden" name="id" value={ev.id} />
                        <input type="hidden" name="isActive" value={(!ev.isActive).toString()} />
                        <button
                          type="submit"
                          className={`px-2.5 h-7 rounded-md text-[12px] font-semibold ${ev.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {ev.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-50">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={6}
                            className="z-50 min-w-[180px] rounded-md bg-white p-2 shadow-md"
                          >
                            <div className="px-2 pb-2 text-[13px] font-semibold text-gray-900">Actions</div>
                            <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                              <button
                                type="button"
                                onClick={() => { setEditing(ev); setOpen(true) }}
                                className="flex items-center gap-2 w-full text-left"
                              >
                                <Pencil className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                <span>Update</span>
                              </button>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                              <button
                                type="button"
                                onClick={() => setPendingDelete(ev)}
                                className="flex items-center gap-2 w-full text-left text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500">{events.length} row(s) total</div>
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 border border-[oklch(.922_0_0)] rounded-md px-2 text-[13px]"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              className="h-8 px-3 rounded-md border border-[oklch(.922_0_0)] text-[13px] disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <span className="text-[13px] text-gray-600 px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="h-8 px-3 rounded-md border border-[oklch(.922_0_0)] text-[13px] disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={open}
        onClose={() => setOpen(false)}
        event={editing ?? undefined}
        action={editing ? actions.updateEvent : actions.createEvent}
        onSuccess={(m) => {
          router.replace(`${pathname}?toast=${encodeURIComponent(m)}`)
        }}
      />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => { if (!o) setPendingDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Delete event?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This will permanently delete <strong>{pendingDelete?.title}</strong> from the database. This action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="h-9 px-4 rounded-md bg-red-600 text-white text-[13px] font-semibold"
                  onClick={async () => {
                    if (pendingDelete) {
                      const fd = new FormData()
                      fd.append('id', pendingDelete.id)
                      try {
                        await actions.deleteEvent(fd)
                        setPendingDelete(null)
                        router.replace(`${pathname}?toast=${encodeURIComponent('Event deleted')}`)
                      } catch (error) {
                        setPendingDelete(null)
                        setToastMsg(error instanceof Error ? error.message : 'Failed to delete event')
                        setToastError(true)
                        setToastOpen(true)
                      }
                    }
                  }}
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-6 right-6 z-[60] rounded-md bg-white border border-[oklch(.922_0_0)] shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw] ${toastError ? 'border-red-200 bg-red-50' : ''}`}
        >
          <div className="flex items-center gap-2">
            {toastError
              ? <AlertCircle className="h-4 w-4 text-red-600" />
              : <CheckCircle2 className="h-4 w-4 text-green-600" />
            }
            <Toast.Title className={`font-semibold ${toastError ? 'text-red-900' : 'text-gray-900'}`}>
              {toastError ? 'Error' : 'Success'}
            </Toast.Title>
          </div>
          <Toast.Description className={`mt-1 ${toastError ? 'text-red-700' : 'text-gray-600'}`}>
            {toastMsg}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-[320px] max-w-[100vw] m-0 list-none z-[60] outline-none" />
      </Toast.Provider>
    </div>
  )
}
