import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageBanner from '@/components/PageBanner'
import EventsGrid from '@/components/EventsGrid'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Events - Astra',
  description: 'Browse all upcoming and ongoing events from Astra.',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid',
}

function formatWhen(event: {
  isOngoing: boolean
  startDate: Date | null
  startTime: string | null
  endTime: string | null
}): string {
  if (event.isOngoing) return 'Ongoing Events'
  if (!event.startDate) return 'Date TBD'
  const d = new Date(event.startDate)
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}\n${dateStr}`
  if (event.startTime) return `${event.startTime}\n${dateStr}`
  return dateStr
}

export default async function EventsPage() {
  const dbEvents = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const events = dbEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    type: e.type as string,
    typeLabel: EVENT_TYPE_LABELS[e.type] ?? e.type,
    when: formatWhen(e),
    imageUrl: e.imageUrl,
  }))

  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <PageBanner
          title="Events"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Events' }]}
        />

        <section className="max-w-[1200px] mx-auto px-6 py-12">
          {events.length > 0 ? (
            <EventsGrid events={events} />
          ) : (
            <div className="py-20 text-center">
              <p className="tsf-font-public-sans text-gray-400 text-[18px]">
                No events available at the moment. Check back soon.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
