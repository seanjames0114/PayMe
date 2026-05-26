'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildPaymentUrl, paymentMethodLabel, formatCurrency } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

interface PaymentModalProps {
  organizerName: string
  paymentMethods: PaymentMethod[]
  amount: number
  onClose: () => void
}

export function PaymentModal({ organizerName, paymentMethods, amount, onClose }: PaymentModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const METHOD_ICONS: Record<string, string> = {
    venmo: '💙',
    cashapp: '💚',
    paypal: '💛',
    zelle: '💜',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Pay {organizerName}</h2>
              <p className="text-sm text-[#94A3B8]">
                Total: <span className="font-semibold text-[#5ECEB8]">{formatCurrency(amount)}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {paymentMethods.map(method => {
              const url = buildPaymentUrl(method.type, method.handle, amount, `PayMe Tab - ${organizerName}`)
              const label = paymentMethodLabel(method.type)

              return (
                <div key={method.type} className="border-2 border-[#F1F5F9] rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{METHOD_ICONS[method.type]}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1E293B]">{label}</p>
                      <p className="text-sm text-[#94A3B8]">{method.handle}</p>
                    </div>
                  </div>

                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#5ECEB8] text-white font-semibold text-sm hover:bg-[#4ab8a4] transition-colors"
                    >
                      <ExternalLink size={15} />
                      Open {label}
                    </a>
                  ) : (
                    <button
                      onClick={() => copyToClipboard(method.handle, method.type)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-[#E2E8F0] text-[#475569] font-semibold text-sm hover:border-[#5ECEB8] hover:text-[#5ECEB8] transition-colors"
                    >
                      {copied === method.type ? (
                        <>
                          <Check size={15} className="text-[#5ECEB8]" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          Copy {method.type === 'zelle' ? 'Zelle address' : 'handle'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
