import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceCardSkeleton from '@/components/skeletons/ServiceCardSkeleton'

export default function ServiceCategoryLoading() {
  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        {/* PageBanner skeleton */}
        <div className="h-[280px] lg:h-[320px] bg-gray-200 animate-pulse" />

        <section className="relative w-full bg-white">
          <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
