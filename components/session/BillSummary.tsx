'use client'

import { motion } from 'framer-motion'
import { CreditCard, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Item, Participant, Selection, Session } from '@/types'

interface BillSummaryProps {
  session: Session
  items: Item[]
  selections: Selection[]
  participants: Participant[]
  myParticipantId: string | null
  onPay: () => void
  isOrganizer: boolean
}

export function BillSummary({
  session,
  items,
  selections,
  participants,
  myParticipantId,
  onPay,
  isOrganizer,
}: BillSummaryProps) {
  if (!myParticipantId) return null

  const mySelections = selections.filter(s => s.participant_id === myParticipantId)
  const myItems = mySelections
    .map(s => items.find(i => i.id === s.item_id))
    .filter(Boolean) as Item[]

  function getItemCost(item: Item): number {
    const splitCount = selections.filter(s => s.item_id === item.id).length
    return splitCount > 0 ? item.price / splitCount : item.price
  }

  const mySubtotal = myItems.reduce((sum, item) => sum + getItemCost(item), 0)
  const totalSubtotal = items.reduce((sum, item) => sum + item.price, 0)
  const myFraction = totalSubtotal > 0 ? mySubtotal / totalSubtotal : 0

  const myTaxShare = (session.tax || 0) * myFraction
  const myTipShare = (session.tip || 0) * myFraction
  const myTotal = mySubtotal + myTaxShare + myTipShare

  const unclaimedItems = items.filter(i => !selections.some(s => s.item_id === i.id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-[#F1F5F9] shadow-sm p-6"
    >
      <h3 className="font-bold text-[#1E293B] mb-4">Your bill</h3>

      {myItems.length === 0 ? (
        <p className="text-sm text-[#94A3B8] mb-4">No items selected yet — tap items above to claim what you ordered.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {myItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#475569] truncate mr-2">{item.name}</span>
              <span className="text-[#1E293B] font-medium flex-shrink-0">{formatCurrency(getItemCost(item))}</span>
            </div>
          ))}
          {(myTaxShare > 0 || myTipShare > 0) && (
            <div className="border-t border-[#F1F5F9] pt-2 space-y-1.5">
              {myTaxShare > 0 && (
                <div className="flex justify-between text-sm text-[#94A3B8]">
                  <span>Tax (your share)</span>
                  <span>{formatCurrency(myTaxShare)}</span>
                </div>
              )}
              {myTipShare > 0 && (
                <div className="flex justify-between text-sm text-[#94A3B8]">
                  <span>Tip (your share)</span>
                  <span>{formatCurrency(myTipShare)}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between font-bold text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
            <span>You owe</span>
            <span className="text-[#5ECEB8]">{formatCurrency(myTotal)}</span>
          </div>
        </div>
      )}

      {unclaimedItems.length > 0 && (
        <div className="flex items-start gap-2 bg-[#FFF5F0] rounded-xl p-3 mb-4 text-xs text-[#C05E3A]">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{unclaimedItems.length} item{unclaimedItems.length > 1 ? 's' : ''} still unclaimed</span>
        </div>
      )}

      {!isOrganizer && myItems.length > 0 && session.payment_methods.length > 0 && (
        <Button onClick={onPay} className="w-full">
          <CreditCard size={18} />
          Pay {session.organizer_name} {formatCurrency(myTotal)}
        </Button>
      )}

      {isOrganizer && (
        <p className="text-xs text-center text-[#94A3B8]">
          You&apos;re the organizer — friends will pay you directly.
        </p>
      )}
    </motion.div>
  )
}
