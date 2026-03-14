import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="tsf-font-public-sans text-[14px] text-[#575d73]">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-x-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.href ? (
                <span className="text-black font-medium">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-[#f37335] transition-colors">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
