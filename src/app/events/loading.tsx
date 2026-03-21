import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventCardSkeleton from '@/components/skeletons/EventCardSkeleton'

export default function EventsLoading() {
  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        {/* PageBanner skeleton */}
        <div className="h-[280px] lg:h-[320px] bg-gray-200 animate-pulse" />

        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
