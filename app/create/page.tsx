'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UploadStep } from '@/components/create/UploadStep'
import { OcrProcessor } from '@/components/create/OcrProcessor'
import { ItemsEditor } from '@/components/create/ItemsEditor'
import { PaymentSetup } from '@/components/create/PaymentSetup'
import type { ParsedReceipt, PaymentMethod } from '@/types'

type Step = 'upload' | 'processing' | 'items' | 'payment'

interface EditableItem {
  id: string
  name: string
  price: string
}

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('upload')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [items, setItems] = useState<EditableItem[]>([])
  const [tax, setTax] = useState('')
  const [tip, setTip] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleImageSelected(file: File) {
    setImageFile(file)
    setStep('processing')
  }

  const handleOcrComplete = useCallback((result: ParsedReceipt) => {
    const editableItems: EditableItem[] = result.items.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      price: item.price.toFixed(2),
    }))
    setItems(editableItems.length > 0 ? editableItems : [{ id: crypto.randomUUID(), name: '', price: '' }])
    if (result.tax > 0) setTax(result.tax.toFixed(2))
    if (result.tip > 0) setTip(result.tip.toFixed(2))
    setStep('items')
  }, [])

  const handleOcrError = useCallback((err: string) => {
    setError(err)
    setItems([{ id: crypto.randomUUID(), name: '', price: '' }])
    setStep('items')
  }, [])

  async function handleSubmit() {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizer_name: organizerName,
          payment_methods: paymentMethods,
          items: items.map(i => ({ name: i.name.trim(), price: parseFloat(i.price) })),
          tax: parseFloat(tax) || 0,
          tip: parseFloat(tip) || 0,
          user_id: user?.id ?? null,
        }),
      })

      if (!res.ok) throw new Error('Failed to create session')

      const { sessionId } = await res.json()

      // Store organizer flag
      localStorage.setItem(`organizer_${sessionId}`, 'true')

      // Save to localStorage only when not signed in (signed-in users use Supabase)
      if (!user) {
        const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)
        const stored = JSON.parse(localStorage.getItem('payme_sessions') || '[]')
        stored.unshift({
          id: sessionId,
          organizer_name: organizerName,
          created_at: new Date().toISOString(),
          item_count: items.length,
          subtotal,
        })
        localStorage.setItem('payme_sessions', JSON.stringify(stored.slice(0, 20)))
      }

      router.push(`/`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const STEP_LABELS: Record<Step, string> = {
    upload: 'Upload receipt',
    processing: 'Reading receipt',
    items: 'Review items',
    payment: 'Payment setup',
  }

  const STEPS: Step[] = ['upload', 'items', 'payment']
  const currentStepIndex = STEPS.indexOf(step === 'processing' ? 'items' : step)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-[#F1F5F9]">
        <Link href="/" className="text-[#64748B] hover:text-[#1E293B] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#5ECEB8] flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-[#1E293B]">PayMe</span>
        </div>
        <span className="text-[#94A3B8] text-sm ml-2">{STEP_LABELS[step]}</span>
      </nav>

      {/* Progress bar */}
      <div className="flex gap-1.5 px-6 pt-4">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= currentStepIndex ? '#5ECEB8' : '#E2E8F0',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'upload' && (
                <UploadStep onImageSelected={handleImageSelected} />
              )}

              {step === 'processing' && imageFile && (
                <OcrProcessor
                  imageFile={imageFile}
                  onComplete={handleOcrComplete}
                  onError={handleOcrError}
                />
              )}

              {step === 'items' && (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-[#FFF0F0] border border-[#FFD6D6] rounded-xl text-sm text-[#C05E3A]">
                      {error} — enter items manually below.
                    </div>
                  )}
                  <ItemsEditor
                    items={items}
                    tax={tax}
                    tip={tip}
                    onItemsChange={setItems}
                    onTaxChange={setTax}
                    onTipChange={setTip}
                    onNext={() => setStep('payment')}
                  />
                </>
              )}

              {step === 'payment' && (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-[#FFF0F0] border border-[#FFD6D6] rounded-xl text-sm text-[#C05E3A]">
                      {error}
                    </div>
                  )}
                  <PaymentSetup
                    organizerName={organizerName}
                    paymentMethods={paymentMethods}
                    onOrganizerNameChange={setOrganizerName}
                    onPaymentMethodsChange={setPaymentMethods}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
