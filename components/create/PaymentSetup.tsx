'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { PaymentMethod } from '@/types'

const PAYMENT_OPTIONS: { type: PaymentMethod['type']; label: string; placeholder: string; prefix?: string }[] = [
  { type: 'venmo', label: 'Venmo', placeholder: 'your-username', prefix: '@' },
  { type: 'cashapp', label: 'Cash App', placeholder: 'your-cashtag', prefix: '$' },
  { type: 'paypal', label: 'PayPal', placeholder: 'your-username', prefix: 'paypal.me/' },
  { type: 'zelle', label: 'Zelle', placeholder: 'phone or email' },
]

interface PaymentSetupProps {
  organizerName: string
  paymentMethods: PaymentMethod[]
  onOrganizerNameChange: (name: string) => void
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void
  onSubmit: () => void
  isLoading: boolean
}

export function PaymentSetup({
  organizerName,
  paymentMethods,
  onOrganizerNameChange,
  onPaymentMethodsChange,
  onSubmit,
  isLoading,
}: PaymentSetupProps) {
  const [selected, setSelected] = useState<Set<PaymentMethod['type']>>(
    new Set(paymentMethods.map(m => m.type))
  )

  function toggleMethod(type: PaymentMethod['type']) {
    const next = new Set(selected)
    if (next.has(type)) {
      next.delete(type)
      onPaymentMethodsChange(paymentMethods.filter(m => m.type !== type))
    } else {
      next.add(type)
      onPaymentMethodsChange([...paymentMethods, { type, handle: '' }])
    }
    setSelected(next)
  }

  function updateHandle(type: PaymentMethod['type'], handle: string) {
    onPaymentMethodsChange(
      paymentMethods.map(m => m.type === type ? { ...m, handle } : m)
    )
  }

  function getHandle(type: PaymentMethod['type']): string {
    return paymentMethods.find(m => m.type === type)?.handle ?? ''
  }

  const isValid =
    organizerName.trim().length > 0 &&
    paymentMethods.length > 0 &&
    paymentMethods.every(m => m.handle.trim().length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">Almost ready!</h2>
        <p className="mt-1 text-[#64748B]">Tell us your name and how you want to get paid</p>
      </div>

      <Input
        label="Your name"
        placeholder="e.g. Sean"
        value={organizerName}
        onChange={e => onOrganizerNameChange(e.target.value)}
        id="organizer-name"
      />

      <div>
        <p className="text-sm font-medium text-[#475569] mb-3">Payment methods</p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_OPTIONS.map(opt => (
            <div key={opt.type}>
              <button
                onClick={() => toggleMethod(opt.type)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-150 font-medium text-sm
                  ${selected.has(opt.type)
                    ? 'border-[#5ECEB8] bg-[#E6FAF7] text-[#1E293B]'
                    : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#CBD5E1]'
                  }
                `}
              >
                <span>{opt.label}</span>
                {selected.has(opt.type) && (
                  <div className="w-5 h-5 rounded-full bg-[#5ECEB8] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {selected.has(opt.type) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div className="relative">
                      {opt.prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">
                          {opt.prefix}
                        </span>
                      )}
                      <input
                        value={getHandle(opt.type)}
                        onChange={e => updateHandle(opt.type, e.target.value)}
                        placeholder={opt.placeholder}
                        className={`w-full py-2 pr-3 rounded-xl border-2 border-[#E2E8F0] focus:outline-none focus:border-[#5ECEB8] text-sm text-[#1E293B] placeholder:text-[#CBD5E1] ${opt.prefix ? 'pl-10' : 'pl-3'}`}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onSubmit} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? (
          <>
            <DollarSign size={18} className="animate-pulse" />
            Creating your tab...
          </>
        ) : (
          'Create Tab & Get Link'
        )}
      </Button>
    </div>
  )
}
