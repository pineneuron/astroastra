'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createEvent(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const slug = rawSlug || slugify(title)
  const description = String(formData.get('description') || '').trim() || null
  const type = String(formData.get('type') || 'ONLINE') as 'ONLINE' | 'OFFLINE' | 'HYBRID'
  const imageUrl = String(formData.get('imageUrl') || '').trim() || null
  const startDateRaw = String(formData.get('startDate') || '').trim()
  const startDate = startDateRaw ? new Date(startDateRaw) : null
  const startTime = String(formData.get('startTime') || '').trim() || null
  const endTime = String(formData.get('endTime') || '').trim() || null
  const isOngoing = String(formData.get('isOngoing') || 'false') === 'true'
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const sortOrder = Number(formData.get('sortOrder') || 0)

  if (!title) return

  let finalSlug = slug
  let i = 2
  while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${i++}`
  }

  const createData: Prisma.EventCreateInput = {
    title,
    slug: finalSlug,
    description: description || undefined,
    type,
    imageUrl: imageUrl || undefined,
    startDate: startDate || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    isOngoing,
    isActive,
    isFeatured,
    sortOrder,
  }
  await prisma.event.create({ data: createData })
  revalidatePath('/admin/events')
}

export async function updateEvent(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const title = String(formData.get('title') || '').trim()
  const rawSlug = String(formData.get('slug') || '').trim()
  const description = String(formData.get('description') || '').trim() || null
  const type = String(formData.get('type') || 'ONLINE') as 'ONLINE' | 'OFFLINE' | 'HYBRID'
  const imageUrl = String(formData.get('imageUrl') || '').trim() || null
  const startDateRaw = String(formData.get('startDate') || '').trim()
  const startDate = startDateRaw ? new Date(startDateRaw) : null
  const startTime = String(formData.get('startTime') || '').trim() || null
  const endTime = String(formData.get('endTime') || '').trim() || null
  const isOngoing = String(formData.get('isOngoing') || 'false') === 'true'
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  const isFeatured = String(formData.get('isFeatured') || 'false') === 'true'
  const sortOrder = Number(formData.get('sortOrder') || 0)

  if (!id) return

  const existingEvent = await prisma.event.findUnique({ where: { id } })
  if (!existingEvent) return

  let finalSlug = rawSlug || slugify(title) || existingEvent.slug
  if (finalSlug) {
    const existing = await prisma.event.findUnique({ where: { slug: finalSlug } })
    if (existing && existing.id !== id) {
      const base = finalSlug
      let n = 2
      finalSlug = `${base}-${n++}`
      while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${base}-${n++}`
      }
    }
  }

  const updateData: Prisma.EventUpdateInput = {
    title,
    slug: finalSlug,
    description: description || undefined,
    type,
    imageUrl: imageUrl || null,
    startDate: startDate || null,
    startTime: startTime || null,
    endTime: endTime || null,
    isOngoing,
    isActive,
    isFeatured,
    sortOrder,
  }
  await prisma.event.update({ where: { id }, data: updateData })
  revalidatePath('/admin/events')
}

export async function toggleEventActive(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const isActive = String(formData.get('isActive') || 'true') === 'true'
  if (!id) return
  await prisma.event.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/events')
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return
  await prisma.event.delete({ where: { id } })
  revalidatePath('/admin/events')
}
