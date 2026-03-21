import { prisma } from '@/lib/db'
import {
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventActive,
} from './actions'
import EventsClient from './EventsClient'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = (sp?.q || '').trim()

  const events = await prisma.event.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <EventsClient
      q={q}
      events={events}
      actions={{
        createEvent,
        updateEvent,
        deleteEvent,
        toggleEventActive,
      }}
    />
  )
}
