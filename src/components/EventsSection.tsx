import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import EventsGrid from './EventsGrid';

const EVENT_TYPE_LABELS: Record<string, string> = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid',
};

function formatWhen(event: {
  isOngoing: boolean;
  startDate: Date | null;
  startTime: string | null;
  endTime: string | null;
}): string {
  if (event.isOngoing) return 'Ongoing Events';
  if (!event.startDate) return 'Date TBD';
  const d = new Date(event.startDate);
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}\n${dateStr}`;
  if (event.startTime) return `${event.startTime}\n${dateStr}`;
  return dateStr;
}

async function getFeaturedEvents() {
  const events = await prisma.event.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 6,
  });
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    type: e.type as string,
    typeLabel: EVENT_TYPE_LABELS[e.type] ?? e.type,
    when: formatWhen(e),
    imageUrl: e.imageUrl,
  }));
}

export default async function EventsSection() {
  const events = await getFeaturedEvents();

  if (events.length === 0) return null;

  return (
    <section className="relative w-full bg-white overflow-hidden py-14">
      {/* Faint decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-[320px] h-[320px] rounded-full bg-[rgba(243,115,53,0.06)] -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full bg-[rgba(244,170,54,0.05)] translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-col lg:flex-row mb-10">
          <h2 className="tsf-font-larken text-black text-[36px]">
            Our Latest Events
          </h2>
          <Link
            href="/events"
            className="flex items-center gap-2 tsf-font-public-sans font-medium text-[16px] text-black hover:opacity-70 transition-opacity"
          >
            View All Events
            <Image src="/images/icon-arrow-right-sm.svg" alt="" width={16} height={10} />
          </Link>
        </div>

        {/* Cards — client component for hover state */}
        <EventsGrid events={events} />
      </div>
    </section>
  );
}
