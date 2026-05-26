'use client'

import { motion } from 'framer-motion'
import { Camera, Users, CreditCard } from 'lucide-react'

const steps = [
  {
    icon: Camera,
    color: '#5ECEB8',
    bg: '#E6FAF7',
    title: 'Snap the receipt',
    description: 'Upload a photo of your receipt. Our OCR reads every item instantly — no typing needed.',
  },
  {
    icon: Users,
    color: '#FF6B6B',
    bg: '#FFE8E8',
    title: 'Everyone picks their items',
    description: 'Share a link with the table. Friends tap what they ordered and take a seat.',
  },
  {
    icon: CreditCard,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'Pay in one tap',
    description: 'Each person sees exactly what they owe. Pay via Venmo, Cash App, PayPal, or Zelle.',
  },
]

export function HowItWorks() {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
          Dead simple, actually
        </h2>
        <p className="mt-3 text-[#64748B] text-lg">Three steps from receipt to paid.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-[#F1F5F9] shadow-sm"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: step.bg }}
            >
              <step.icon size={26} color={step.color} />
            </div>
            <div className="text-4xl font-black text-[#F1F5F9] mb-3">0{i + 1}</div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">{step.title}</h3>
            <p className="text-[#64748B] leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
