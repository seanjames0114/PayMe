'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface JoinModalProps {
  sessionOrganizerName: string
  onJoin: (name: string) => void
  isLoading: boolean
  isOrganizer?: boolean
  sessionUrl?: string
}

export function JoinModal({ sessionOrganizerName, onJoin, isLoading, isOrganizer, sessionUrl }: JoinModalProps) {
  const [name, setName] = useState(isOrganizer ? sessionOrganizerName : '')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!sessionUrl) return
    try {
      if (navigator.share) {
        await navigator.share({ title: `${sessionOrganizerName}'s Tab`, url: sessionUrl })
      } else {
        await navigator.clipboard.writeText(sessionUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(sessionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isOrganizer) {
    return (
      <div className="fixed inset-0 bg-[#FFFBF7] flex items-center justify-center p-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E6FAF7] flex items-center justify-center mb-4">
              <Share2 size={28} className="text-[#5ECEB8]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Your tab is ready!</h1>
            <p className="mt-2 text-[#64748B]">
              Share this link with your group so they can claim their items
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border-2 border-[#E2E8F0] hover:border-[#5ECEB8] rounded-2xl px-4 py-3 mb-6 transition-all group"
          >
            <p className="flex-1 text-sm text-[#475569] font-mono truncate text-left">{sessionUrl}</p>
            <div className="flex items-center gap-1.5 bg-[#5ECEB8] text-white rounded-xl px-3 py-1.5 text-xs font-semibold flex-shrink-0 group-hover:bg-[#4ab8a4] transition-colors">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy link'}
            </div>
          </button>

          <div className="space-y-4">
            <Input
              label="Your name"
              placeholder="e.g. Sean"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
              id="organizer-name"
              autoFocus
            />
            <Button
              onClick={() => onJoin(name.trim())}
              disabled={!name.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Starting...' : 'Start splitting'}
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#FFFBF7] flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#E6FAF7] flex items-center justify-center mb-4">
            <Users size={28} className="text-[#5ECEB8]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {sessionOrganizerName}&apos;s Tab
          </h1>
          <p className="mt-2 text-[#64748B]">
            Enter your name to join the table and pick your items
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Your name"
            placeholder="e.g. Jamie"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
            id="participant-name"
            autoFocus
          />
          <Button
            onClick={() => onJoin(name.trim())}
            disabled={!name.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Joining...' : 'Join the table'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
