'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Participant, Selection, Item } from '@/types'

interface TableViewProps {
  participants: Participant[]
  selections: Selection[]
  items: Item[]
  myParticipantId: string | null
}

export function TableView({ participants, selections, items, myParticipantId }: TableViewProps) {
  const size = 280
  const cx = size / 2
  const cy = size / 2
  const radius = 100

  function getSeatPosition(index: number, total: number) {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  function getParticipantItemCount(participantId: string): number {
    return selections.filter(s => s.participant_id === participantId).length
  }

  const claimedCount = selections.length
  const totalItems = items.length

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">The Table</p>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Table surface */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#F8F4EE] to-[#EDE8E0] border-4 border-[#D4C5B0] shadow-inner"
          style={{
            width: 160,
            height: 160,
            top: cy - 80,
            left: cx - 80,
          }}
        />

        {/* Center label */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ width: 160, height: 160, top: cy - 80, left: cx - 80 }}
        >
          <span className="text-2xl font-black text-[#8B6F47]">
            {claimedCount}/{totalItems}
          </span>
          <span className="text-xs font-medium text-[#A08060]">items</span>
          <span className="text-xs text-[#B09070] mt-0.5">claimed</span>
        </div>

        {/* Participant seats */}
        <AnimatePresence>
          {participants.map((p, i) => {
            const pos = getSeatPosition(i, participants.length)
            const isMe = p.id === myParticipantId
            const itemCount = getParticipantItemCount(p.id)
            const initials = p.name.slice(0, 2).toUpperCase()

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute flex flex-col items-center"
                style={{
                  left: pos.x - 28,
                  top: pos.y - 28,
                  zIndex: isMe ? 10 : 1,
                }}
              >
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm text-[#475569] shadow-md transition-transform"
                  style={{
                    backgroundColor: p.color,
                    border: isMe ? '3px solid #5ECEB8' : '3px solid white',
                    transform: isMe ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {initials}
                </div>

                {/* Name + item count */}
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-[#475569] bg-white rounded-full px-2 py-0.5 shadow-sm whitespace-nowrap max-w-[70px] truncate">
                    {isMe ? 'You' : p.name}
                  </span>
                  {itemCount > 0 && (
                    <span className="text-[9px] text-[#94A3B8] mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
