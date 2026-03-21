import Image from 'next/image'
import Link from 'next/link'

type BreadcrumbItem = { label: string; href?: string }

type Props = {
  title: string
  image?: string
  breadcrumbs: BreadcrumbItem[]
}

export default function PageBanner({
  title,
  image = '/images/about-hero.jpg',
  breadcrumbs,
}: Props) {
  return (
    <div className="relative h-[280px] lg:h-[320px] overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover object-center"
        priority
      />
      {/* Green overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(12,169,89,0.88), rgba(7,110,56,0.92))' }}
      />
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <h1 className="tsf-font-larken text-white text-[48px] lg:text-[65px] leading-[1.1]">{title}</h1>
        <p className="tsf-font-larken text-[16px] lg:text-[18px] flex items-center gap-1">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="tsf-font-larken-medium text-white/70 mx-1">&gt;</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="tsf-font-larken font-bold text-white/70 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="tsf-font-larken-medium text-white">{item.label}</span>
              )}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
