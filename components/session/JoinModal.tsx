'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface JoinModalProps {
  sessionOrganizerName: string
  onJoin: (name: string) => void
  isLoading: boolean
}

export function JoinModal({ sessionOrganizerName, onJoin, isLoading }: JoinModalProps) {
  const [name, setName] = useState('')

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
