'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Receipt, ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 bg-white border-2 border-[#E2E8F0] rounded-full px-4 py-2 mb-8 text-sm font-medium text-[#5ECEB8]"
      >
        <Receipt size={16} />
        Split bills in seconds
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-6xl font-bold text-[#1E293B] leading-tight max-w-2xl"
      >
        Split the bill,{' '}
        <span className="text-[#5ECEB8]">not the friendship</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-xl text-[#64748B] max-w-lg leading-relaxed"
      >
        Snap your receipt, share a link, and let everyone pick exactly what they ordered. No more mental math.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col sm:flex-row gap-4"
      >
        <Link href="/create">
          <Button size="lg" className="shadow-lg shadow-[#5ECEB8]/25">
            Start a Tab
            <ArrowRight size={20} />
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Tonight&apos;s Bill</p>
              <p className="text-2xl font-bold text-[#1E293B]">$84.50</p>
            </div>
            <div className="flex -space-x-2">
              {['#FFB3BA', '#BAE1FF', '#BAFFC9', '#D4B3FF'].map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-[#475569]"
                  style={{ backgroundColor: color }}
                >
                  {['S', 'J', 'M', 'A'][i]}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Margherita Pizza', price: '$18.00', color: '#BAFFC9', user: 'M' },
              { name: 'Caesar Salad', price: '$12.50', color: '#BAE1FF', user: 'J' },
              { name: 'Pasta Carbonara', price: '$22.00', color: '#FFB3BA', user: 'S' },
              { name: 'Tiramisu', price: '$9.00', color: '#D4B3FF', user: 'A' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: item.color + '33' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#475569]" style={{ backgroundColor: item.color }}>
                    {item.user}
                  </div>
                  <span className="text-sm font-medium text-[#1E293B]">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#475569]">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
