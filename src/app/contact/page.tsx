import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import PageBanner from '@/components/PageBanner'
import { MapPin, Phone, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact - Astra',
  description: 'Get in touch with Astra. We\'d love to hear from you.',
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: process.env.COMPANY_ADDRESS || 'Bishalnagar, Kathmandu 44600, Nepal',
  },
  {
    icon: Phone,
    label: process.env.COMPANY_PHONE || '+977 01-4444444',
  },
  {
    icon: Mail,
    label: process.env.ADMIN_EMAIL || 'info@astra.com',
  },
]

export default function ContactPage() {
  return (
    <>
      <Header variant="inner" />
      <main>
        <PageBanner
          title="Contact"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        />

        {/* ── Contact Section ── */}
        <section className="max-w-[1200px] mx-auto px-6 pt-[96px] pb-16">
          <div className="rounded-[10px] overflow-hidden shadow-[0px_4px_30px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row">

            {/* Left — Info panel */}
            <div
              className="flex flex-col px-10 py-12 lg:w-[47%]"
              style={{ background: '#0ca959' }}
            >
              <p className="text-white text-[14px] font-bold uppercase tracking-widest mb-3">
                CONTACT US
              </p>
              <h2 className="tsf-font-larken text-white text-[40px] lg:text-[45px] leading-[1.2] mb-10">
                Contact Information
              </h2>

              <div className="flex flex-col gap-8 mt-2">
                {CONTACT_INFO.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-5">
                    {/* Circle icon badge */}
                    <div className="shrink-0 h-[70px] w-[70px] rounded-full bg-white/20 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white text-[16px] tsf-font-public-sans leading-[1.5]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Form */}
            <div className="flex flex-col px-10 py-12 bg-[#f7f8fb] lg:w-[53%]">
              <h2 className="tsf-font-larken-medium text-[#222] text-[25px] mb-8">
                Have a question?
              </h2>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── Map Section ── */}
        <section className="max-w-[1200px] mx-auto px-6 pb-[115px]">
          <div className="rounded-[10px] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.15)] h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.7584027568366!2d85.32737431506226!3d27.72017098278832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a74f4b60f%3A0x5d7e0f8a4c4f47b1!2sBishalnagar%2C%20Kathmandu!5e0!3m2!1sen!2snp!4v1710000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Astra Location"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
