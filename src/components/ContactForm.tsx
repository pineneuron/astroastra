'use client'

import { useState } from 'react'
import Image from 'next/image'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: 'Contact Inquiry',
          message: phone ? `Phone: ${phone}\n\n${message}` : message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data?.errors?.join(', ') || data?.error || 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  const inputClass =
    'w-full h-[50px] bg-white border border-[#e6ccc2] rounded-[4px] px-4 text-[14px] text-gray-800 placeholder:text-[#9094a1] focus:outline-none focus:border-[#f37335] transition-colors'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <label className="block tsf-font-public-sans text-[14px] text-black mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block tsf-font-public-sans text-[14px] text-black mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block tsf-font-public-sans text-[14px] text-black mb-1">Phone no:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block tsf-font-public-sans text-[14px] text-black mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          required
          rows={6}
          className="w-full bg-white border border-[#e6ccc2] rounded-[4px] px-4 py-3 text-[14px] text-gray-800 placeholder:text-[#9094a1] focus:outline-none focus:border-[#f37335] transition-colors resize-none"
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-red-600 text-[13px]">{errorMsg}</p>
      )}

      {/* Success */}
      {status === 'success' && (
        <p className="text-green-700 text-[14px] font-medium">
          Thank you! We&apos;ll get back to you soon.
        </p>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-3 h-[56px] px-8 rounded-[50px] text-white tsf-font-public-sans text-[18px] font-medium transition-opacity hover:opacity-85 disabled:opacity-60"
          style={{ background: 'linear-gradient(to right, rgba(244,170,54,0.9), rgba(243,115,53,0.9))' }}
        >
          {status === 'loading' ? 'Sending…' : 'Submit'}
          {status !== 'loading' && (
            <Image src="/images/hero-arrow-btn.svg" alt="" width={32} height={32} />
          )}
        </button>
      </div>
    </form>
  )
}
