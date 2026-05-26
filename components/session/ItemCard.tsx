'use client'

import { motion } from 'framer-motion'
import { Check, Plus, Minus } from 'lucide-react'
import type { Item, Participant, Selection } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ItemCardProps {
  item: Item
  selections: Selection[]
  participants: Participant[]
  myParticipantId: string | null
  onClaim: (itemId: string) => void
  onRelease: (itemId: string) => void
}

export function ItemCard({
  item,
  selections,
  participants,
  myParticipantId,
  onClaim,
  onRelease,
}: ItemCardProps) {
  const itemSelections = selections.filter(s => s.item_id === item.id)
  const isMine = itemSelections.some(s => s.participant_id === myParticipantId)
  const claimers = itemSelections
    .map(s => participants.find(p => p.id === s.participant_id))
    .filter(Boolean) as Participant[]

  const splitCount = claimers.length
  const pricePerPerson = splitCount > 0 ? item.price / splitCount : item.price

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-2xl p-4 border-2 transition-all duration-200
        ${isMine
          ? 'border-[#5ECEB8] bg-[#E6FAF7]'
          : claimers.length > 0
            ? 'border-[#E2E8F0] bg-[#F8FAFC]'
            : 'border-[#FFD6D6] bg-[#FFF5F5]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1E293B] truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-[#475569]">{formatCurrency(item.price)}</span>
            {splitCount > 1 && (
              <span className="text-xs text-[#94A3B8]">
                → {formatCurrency(pricePerPerson)} each
              </span>
            )}
          </div>

          {/* Claimers */}
          {claimers.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-1.5">
                {claimers.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    title={p.name}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#475569]"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs text-[#94A3B8]">
                {claimers.length === 1
                  ? claimers[0].id === myParticipantId ? 'You' : claimers[0].name
                  : `${claimers.length} splitting`
                }
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {myParticipantId && (
          <button
            onClick={() => isMine ? onRelease(item.id) : onClaim(item.id)}
            className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90
              ${isMine
                ? 'bg-[#5ECEB8] text-white hover:bg-[#4ab8a4]'
                : 'bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FFE8E8]'
              }
            `}
          >
            {isMine ? <Minus size={18} /> : <Plus size={18} />}
          </button>
        )}
      </div>

      {/* Split indicator */}
      {claimers.length > 1 && isMine && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5ECEB8] font-medium">
          <Check size={12} />
          Splitting {formatCurrency(pricePerPerson)} with {claimers.length - 1} other{claimers.length > 2 ? 's' : ''}
        </div>
      )}
    </motion.div>
  )
}
