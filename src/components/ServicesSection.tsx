'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { useCurrency } from '@/context/CurrencyContext';
import { useFavourites } from '@/context/FavouritesContext';

export type ServiceItem = {
  title: string;
  price?: number;
  priceUnit?: string;
  /** Original price before sale – shown struck through when present */
  originalPrice?: number;
  /** Shown instead of price when no price/priceUnit (e.g. "Consult & discover") */
  priceAlternativeText?: string;
  image: string;
  href: string;
  slug: string;
  buttonText: string;
};

export default function ServicesSection({ services, className }: { services: ServiceItem[]; className?: string }) {
  const { formatPrice } = useCurrency();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  return (
    <section className={`relative w-full bg-white ${className ?? ''}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => {
            const isBookable = svc.price != null && svc.price > 0;
            const imageContent = (
              <>
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Favourite */}
                <button
                  type="button"
                  aria-label={isFavourite(svc.slug) ? 'Remove from favourites' : 'Add to favourites'}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center z-10 cursor-pointer hover:opacity-80 transition-opacity rounded-full bg-white/90 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavourite(svc.slug);
                  }}
                >
                  {isFavourite(svc.slug) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#d97706]">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <Image src="/images/icon-wishlist.svg" alt="" width={22} height={22} />
                  )}
                </button>
              </>
            );
            return (
              <div
                key={svc.title}
                className="flex flex-col group bg-white rounded-[12px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.13)] transition-shadow duration-300"
              >
                {/* Image — no border, flush to top */}
                {isBookable ? (
                  <Link href={svc.href} className="relative h-[220px] w-full shrink-0 overflow-hidden block cursor-pointer">
                    {imageContent}
                  </Link>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowComingSoonModal(true)}
                    onKeyDown={(e) => e.key === 'Enter' && setShowComingSoonModal(true)}
                    className="relative h-[220px] w-full shrink-0 overflow-hidden block cursor-pointer"
                  >
                    {imageContent}
                  </div>
                )}

                {/* Body */}
                <div className="p-6 flex flex-col flex-1 gap-3">
                  {isBookable ? (
                    <Link href={svc.href} className="tsf-font-larken-medium text-black text-[21px] tracking-[-0.03em] leading-snug block hover:text-[#d97706] transition-colors">
                      {svc.title}
                    </Link>
                  ) : (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowComingSoonModal(true)}
                      onKeyDown={(e) => e.key === 'Enter' && setShowComingSoonModal(true)}
                      className="tsf-font-larken-medium text-black text-[21px] tracking-[-0.03em] leading-snug block cursor-pointer hover:text-[#d97706] transition-colors"
                    >
                      {svc.title}
                    </span>
                  )}

                  {/* Price / Stars / Alternative text */}
                  {(() => {
                    const { price, priceUnit, originalPrice, priceAlternativeText } = svc;
                    if (price != null && priceUnit) {
                      return (
                        <div className="flex flex-wrap items-center gap-3">
                          {originalPrice != null && (
                            <span className="tsf-font-public-sans font-medium text-gray-400 text-[14px] line-through">
                              {formatPrice(originalPrice, priceUnit)}
                            </span>
                          )}
                          <span className="tsf-font-public-sans font-semibold text-[#d97706] text-[18px]">
                            {formatPrice(price, priceUnit)}
                          </span>
                          <div className="flex items-center gap-0.5" aria-label="4 to 5 stars">
                            {[1, 2, 3, 4].map((i) => (
                              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#d97706]">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ))}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#d97706] opacity-60">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          </div>
                        </div>
                      );
                    }
                    if (priceAlternativeText) {
                      return (
                        <span className="tsf-font-public-sans font-semibold text-[#d97706] text-[16px]">
                          {priceAlternativeText}
                        </span>
                      );
                    }
                    return null;
                  })()}

                  {/* Divider */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {isBookable ? (
                      <Link
                        href={svc.href}
                        className="inline-flex items-center gap-3 h-[45px] px-6 rounded-[50px] text-white tsf-font-public-sans text-[15px] font-medium"
                        style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
                      >
                        {svc.buttonText}
                        <Image src="/images/hero-arrow-btn.svg" alt="" width={28} height={28} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowComingSoonModal(true)}
                        className="inline-flex items-center gap-3 h-[45px] px-6 rounded-[50px] text-white tsf-font-public-sans text-[15px] font-medium"
                        style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
                      >
                        {svc.buttonText}
                        <Image src="/images/hero-arrow-btn.svg" alt="" width={28} height={28} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Coming Soon modal */}
      <Dialog.Root open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
            <Dialog.Title className="text-xl font-semibold tsf-font-larken text-center text-black">
              Service Coming Soon
            </Dialog.Title>
            <p className="mt-3 text-center text-gray-600 tsf-font-public-sans">
              This service will be available soon. Please check back later.
            </p>
            <Dialog.Close asChild>
              <button
                type="button"
                className="mt-6 w-full h-[45px] rounded-[50px] text-white tsf-font-public-sans font-medium"
                style={{
                  background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))',
                }}
              >
                OK
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
