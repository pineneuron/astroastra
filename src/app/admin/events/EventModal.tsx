'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Props = {
  isOpen: boolean
  onClose: () => void
  event?: {
    id: string
    title: string
    slug: string
    description?: string | null
    type: string
    imageUrl?: string | null
    startDate?: Date | string | null
    startTime?: string | null
    endTime?: string | null
    isOngoing: boolean
    isActive: boolean
    isFeatured: boolean
    sortOrder: number
  }
  action: (fd: FormData) => Promise<void>
  onSuccess?: (message: string) => void
}

function toDateInputValue(val?: Date | string | null): string {
  if (!val) return ''
  const d = typeof val === 'string' ? new Date(val) : val
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function EventModal({ isOpen, onClose, event, action, onSuccess }: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [slug, setSlug] = useState(event?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!event?.slug)
  const [description, setDescription] = useState(event?.description ?? '')
  const [type, setType] = useState(event?.type ?? 'ONLINE')
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? '')
  const [startDate, setStartDate] = useState(toDateInputValue(event?.startDate))
  const [startTime, setStartTime] = useState(event?.startTime ?? '')
  const [endTime, setEndTime] = useState(event?.endTime ?? '')
  const [isOngoing, setIsOngoing] = useState(event?.isOngoing ?? false)
  const [isActive, setIsActive] = useState(event?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured ?? false)
  const [sortOrder, setSortOrder] = useState(event?.sortOrder ?? 0)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setSlug(event.slug)
      setSlugTouched(true)
      setDescription(event.description ?? '')
      setType(event.type)
      setImageUrl(event.imageUrl ?? '')
      setStartDate(toDateInputValue(event.startDate))
      setStartTime(event.startTime ?? '')
      setEndTime(event.endTime ?? '')
      setIsOngoing(event.isOngoing)
      setIsActive(event.isActive)
      setIsFeatured(event.isFeatured)
      setSortOrder(event.sortOrder)
    } else {
      setTitle('')
      setSlug('')
      setSlugTouched(false)
      setDescription('')
      setType('ONLINE')
      setImageUrl('')
      setStartDate('')
      setStartTime('')
      setEndTime('')
      setIsOngoing(false)
      setIsActive(true)
      setIsFeatured(false)
      setSortOrder(0)
    }
  }, [event, isOpen])

  const isEdit = !!event?.id

  const handleUpload = async (file: File) => {
    const body = new FormData()
    body.append('file', file)
    body.append('folder', 'astra-events')
    setUploading(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data?.url) setImageUrl(data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[85vh] overflow-y-auto thin-scrollbar">
          <div className="flex items-center justify-between px-4 py-3 border-b border-b-[oklch(.922_0_0)]">
            <Dialog.Title className="text-xl font-semibold">{isEdit ? 'Edit Event' : 'Add Event'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700">×</button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData()
              if (isEdit) fd.append('id', event!.id)
              fd.append('title', title)
              fd.append('slug', slugTouched ? slug : slugify(title))
              fd.append('description', description)
              fd.append('type', type)
              fd.append('imageUrl', imageUrl)
              fd.append('startDate', startDate)
              fd.append('startTime', startTime)
              fd.append('endTime', endTime)
              fd.append('isOngoing', String(isOngoing))
              fd.append('isActive', String(isActive))
              fd.append('isFeatured', String(isFeatured))
              fd.append('sortOrder', String(sortOrder))
              setSubmitting(true)
              try {
                await action(fd)
                onSuccess?.(isEdit ? 'Event updated' : 'Event created')
                onClose()
              } finally {
                setSubmitting(false)
              }
            }}
            className="p-4 space-y-4"
          >
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!slugTouched) setSlug(slugify(e.target.value))
                  }}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  placeholder="Event title"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                  onBlur={() => setSlugTouched(true)}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                  placeholder="event-slug"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-[oklch(.922_0_0)] rounded-md px-3 py-2 text-[13px] resize-none"
                placeholder="Optional description"
              />
            </div>

            {/* Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                  className="h-9 w-full border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-2">Schedule</label>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox.Root
                  id="isOngoing"
                  checked={isOngoing}
                  onCheckedChange={(c) => setIsOngoing(c === true)}
                  className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center admin-checkbox"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="isOngoing" className="text-[13px] font-medium">Ongoing Event (no specific date)</label>
              </div>
              {!isOngoing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="e.g. 10:30 am"
                      className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1">End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="e.g. 4:00 pm"
                      className="w-full h-9 border border-[oklch(.922_0_0)] rounded-md px-3 text-[13px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Image</label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-[oklch(.922_0_0)]">
                    <Image src={imageUrl} alt="Event" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <label className="flex flex-col items-center justify-center w-32 h-24 rounded-md border border-dashed border-[oklch(.922_0_0)] cursor-pointer hover:bg-gray-50">
                  <span className="text-[12px] text-gray-500">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f) }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(c) => setIsActive(c === true)}
                  className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center admin-checkbox"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="isActive" className="text-[13px] font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox.Root
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(c) => setIsFeatured(c === true)}
                  className="h-4 w-4 rounded border border-gray-300 flex items-center justify-center admin-checkbox"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3 w-3 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label htmlFor="isFeatured" className="text-[13px] font-medium">Featured — show in home page events section</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[oklch(.922_0_0)]">
              <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-[13px]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-md admin-btn-primary text-white text-[13px] font-semibold disabled:opacity-60"
              >
                {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
