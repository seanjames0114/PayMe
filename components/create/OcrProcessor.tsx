'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { extractTextFromImage } from '@/lib/ocr'
import { parseReceiptText } from '@/lib/receiptParser'
import type { ParsedReceipt } from '@/types'

const MESSAGES = [
  'Reading your receipt...',
  'Deciphering the handwriting...',
  'Counting the crumbs...',
  'Almost there...',
]

interface OcrProcessorProps {
  imageFile: File
  onComplete: (result: ParsedReceipt) => void
  onError: (error: string) => void
}

export function OcrProcessor({ imageFile, onComplete, onError }: OcrProcessorProps) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const text = await extractTextFromImage(imageFile, (p) => {
          if (!cancelled) setProgress(p)
        })
        if (!cancelled) {
          const result = parseReceiptText(text)
          onComplete(result)
        }
      } catch {
        if (!cancelled) onError('Could not read the receipt. Please try a clearer image.')
      }
    }

    run()
    return () => { cancelled = true }
  }, [imageFile, onComplete, onError])

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="#5ECEB8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * progress) / 100}
            transition={{ duration: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#1E293B]">{progress}%</span>
        </div>
      </div>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="text-lg font-medium text-[#475569]"
      >
        {MESSAGES[messageIndex]}
      </motion.p>

      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#5ECEB8]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}
