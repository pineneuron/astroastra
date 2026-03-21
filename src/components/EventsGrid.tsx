'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type EventCard = {
  id: string;
  title: string;
  slug: string;
  type: string;
  typeLabel: string;
  when: string;
  imageUrl: string | null;
};

const TYPE_ICON: Record<string, string> = {
  ONLINE: '/images/icon-video.svg',
  OFFLINE: '/images/icon-location.svg',
  HYBRID: '/images/icon-video.svg',
};

export default function EventsGrid({ events }: { events: EventCard[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {events.map((event, i) => {
        const active = hovered === i;
        return (
          <div
            key={event.id}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="rounded-[10px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col p-6 gap-4 transition-all duration-300 cursor-default"
            style={
              active
                ? { background: 'linear-gradient(to top, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }
                : { background: '#ffffff' }
            }
          >
            {/* Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#460b04] rounded-[3px] px-2.5 h-[32px]">
                <Image
                  src={TYPE_ICON[event.type] ?? '/images/icon-video.svg'}
                  alt=""
                  width={14}
                  height={12}
                  onError={() => {}}
                />
                <span className="tsf-font-public-sans font-medium text-[10px] text-[#d97706] uppercase tracking-wide">
                  {event.typeLabel}
                </span>
              </div>
              <Link
                href={`/events/${event.slug}/book`}
                className="flex items-center justify-center rounded-[3px] px-3 h-[32px] transition-colors duration-300"
                style={
                  active
                    ? { background: '#460b04' }
                    : { background: 'linear-gradient(to bottom, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }
                }
              >
                <span className="tsf-font-public-sans font-medium text-[10px] text-white uppercase tracking-wide">
                  Book Now
                </span>
              </Link>
            </div>

            {/* Title */}
            <h3 className={`tsf-font-larken-medium text-[19px] leading-[30px] underline flex-1 transition-colors duration-300 ${active ? 'text-white' : 'text-black'}`}>
              {event.title}
            </h3>

            {/* When */}
            <div>
              <p className={`tsf-font-larken-medium text-[12px] uppercase mb-1 transition-colors duration-300 ${active ? 'text-white/80' : 'text-[#d97706]'}`}>
                When
              </p>
              <p className={`tsf-font-public-sans text-[16px] leading-[26px] font-light whitespace-pre-line transition-colors duration-300 ${active ? 'text-white' : 'text-black'}`}>
                {event.when}
              </p>
            </div>

            {/* Divider + View Details */}
            <div className="border-t border-[#d9d9d9] pt-4 flex items-center justify-between">
              <Link
                href={`/events/${event.slug}`}
                className={`tsf-font-public-sans font-medium text-[16px] underline hover:opacity-70 transition-colors duration-300 cursor-pointer ${active ? 'text-white' : 'text-black'}`}
              >
                View Event Details
              </Link>
              <Link href={`/events/${event.slug}`} aria-label="View event details" className="shrink-0 cursor-pointer">
                <Image
                  src={active ? '/images/icon-arrow-circle-light.svg' : '/images/icon-arrow-circle-dark.svg'}
                  alt=""
                  width={35}
                  height={35}
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
