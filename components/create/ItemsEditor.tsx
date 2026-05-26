'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

interface EditableItem {
  id: string
  name: string
  price: string
}

interface ItemsEditorProps {
  items: EditableItem[]
  tax: string
  tip: string
  onItemsChange: (items: EditableItem[]) => void
  onTaxChange: (tax: string) => void
  onTipChange: (tip: string) => void
  onNext: () => void
}

export function ItemsEditor({
  items,
  tax,
  tip,
  onItemsChange,
  onTaxChange,
  onTipChange,
  onNext,
}: ItemsEditorProps) {
  const [showExtras, setShowExtras] = useState(false)

  function updateItem(id: string, field: 'name' | 'price', value: string) {
    onItemsChange(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function removeItem(id: string) {
    onItemsChange(items.filter(item => item.id !== id))
  }

  function addItem() {
    onItemsChange([...items, { id: crypto.randomUUID(), name: '', price: '' }])
  }

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  const taxAmount = parseFloat(tax) || 0
  const tipAmount = parseFloat(tip) || 0
  const total = subtotal + taxAmount + tipAmount

  const isValid = items.length > 0 && items.every(i => i.name.trim() && parseFloat(i.price) > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">Review your items</h2>
        <p className="mt-1 text-[#64748B]">Make sure everything looks right before sharing</p>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 items-center"
            >
              <div className="flex-1">
                <input
                  value={item.name}
                  onChange={e => updateItem(item.id, 'name', e.target.value)}
                  placeholder="Item name"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:outline-none focus:border-[#5ECEB8] text-sm text-[#1E293B] placeholder:text-[#CBD5E1]"
                />
              </div>
              <div className="w-24">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                  <input
                    value={item.price}
                    onChange={e => updateItem(item.id, 'price', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:outline-none focus:border-[#5ECEB8] text-sm text-[#1E293B] placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-[#CBD5E1] hover:text-[#FF6B6B] transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-[#5ECEB8] font-semibold text-sm hover:text-[#4ab8a4] transition-colors"
      >
        <Plus size={18} />
        Add item
      </button>

      {/* Tax & Tip toggle */}
      <div className="border-t border-[#F1F5F9] pt-4">
        <button
          onClick={() => setShowExtras(v => !v)}
          className="flex items-center gap-2 text-sm font-medium text-[#475569] hover:text-[#1E293B] transition-colors"
        >
          {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showExtras ? 'Hide' : 'Add'} tax &amp; tip
        </button>

        <AnimatePresence>
          {showExtras && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 mt-4"
            >
              <div className="flex-1">
                <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Tax</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                  <input
                    value={tax}
                    onChange={e => onTaxChange(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:outline-none focus:border-[#5ECEB8] text-sm text-[#1E293B] placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Tip</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">$</span>
                  <input
                    value={tip}
                    onChange={e => onTipChange(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-[#E2E8F0] focus:outline-none focus:border-[#5ECEB8] text-sm text-[#1E293B] placeholder:text-[#CBD5E1]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Totals */}
      <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm text-[#64748B]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-[#64748B]">
            <span>Tax</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        {tipAmount > 0 && (
          <div className="flex justify-between text-sm text-[#64748B]">
            <span>Tip</span>
            <span>{formatCurrency(tipAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full">
        Looks good — continue
      </Button>
    </div>
  )
}
