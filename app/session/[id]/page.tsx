'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getParticipantColor, formatCurrency } from '@/lib/utils'
import { JoinModal } from '@/components/session/JoinModal'
import { TableView } from '@/components/session/TableView'
import { ItemCard } from '@/components/session/ItemCard'
import { BillSummary } from '@/components/session/BillSummary'
import { PaymentModal } from '@/components/session/PaymentModal'
import type { Session, Item, Participant, Selection } from '@/types'

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [session, setSession] = useState<Session | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selections, setSelections] = useState<Selection[]>([])
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null)
  const [showJoin, setShowJoin] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load session data
  useEffect(() => {
    async function load() {
      const [{ data: sessionData }, { data: itemsData }, { data: participantsData }] =
        await Promise.all([
          supabase.from('sessions').select('*').eq('id', id).single(),
          supabase.from('items').select('*').eq('session_id', id).order('name'),
          supabase.from('participants').select('*').eq('session_id', id).order('joined_at'),
        ])

      if (!sessionData) {
        setError('Tab not found or has expired.')
        setLoading(false)
        return
      }

      setSession(sessionData)
      setItems(itemsData ?? [])
      setParticipants(participantsData ?? [])

      const participantIds = (participantsData ?? []).map((p: Participant) => p.id)
      if (participantIds.length > 0) {
        const { data: sels } = await supabase
          .from('selections')
          .select('*')
          .in('participant_id', participantIds)
        setSelections(sels ?? [])
      }

      // Check stored participant
      const storedId = localStorage.getItem(`participant_${id}`)
      const isOrganizer = localStorage.getItem(`organizer_${id}`) === 'true'

      if (storedId && (participantsData ?? []).some((p: Participant) => p.id === storedId)) {
        setMyParticipantId(storedId)
      } else if (isOrganizer) {
        // Organizer needs to join as a participant too
        setShowJoin(true)
      } else {
        setShowJoin(true)
      }

      setLoading(false)
    }

    load()
  }, [id])

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`session:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants', filter: `session_id=eq.${id}` },
        (payload) => setParticipants(prev => [...prev, payload.new as Participant])
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'selections' },
        (payload) => setSelections(prev => [...prev, payload.new as Selection])
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'selections' },
        (payload) => setSelections(prev => prev.filter(s => s.id !== payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  const handleJoin = useCallback(async (name: string) => {
    setIsJoining(true)
    const isOrganizer = localStorage.getItem(`organizer_${id}`) === 'true'
    const colorIndex = participants.length
    const color = getParticipantColor(colorIndex)

    const { data, error } = await supabase
      .from('participants')
      .insert({
        session_id: id,
        name,
        color,
        is_organizer: isOrganizer,
      })
      .select()
      .single()

    if (!error && data) {
      setMyParticipantId(data.id)
      localStorage.setItem(`participant_${id}`, data.id)
      setShowJoin(false)
    }

    setIsJoining(false)
  }, [id, participants.length])

  async function handleClaim(itemId: string) {
    if (!myParticipantId) return
    await supabase.from('selections').insert({ participant_id: myParticipantId, item_id: itemId })
  }

  async function handleRelease(itemId: string) {
    if (!myParticipantId) return
    await supabase
      .from('selections')
      .delete()
      .eq('participant_id', myParticipantId)
      .eq('item_id', itemId)
  }

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${session?.organizer_name}'s Tab`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const myParticipant = participants.find(p => p.id === myParticipantId)
  const isOrganizer = myParticipant?.is_organizer ?? false

  const mySelections = selections.filter(s => s.participant_id === myParticipantId)
  const myItems = mySelections.map(s => items.find(i => i.id === s.item_id)).filter(Boolean) as Item[]
  const mySubtotal = myItems.reduce((sum, item) => {
    const splitCount = selections.filter(s => s.item_id === item.id).length
    return sum + (splitCount > 0 ? item.price / splitCount : item.price)
  }, 0)
  const totalSubtotal = items.reduce((sum, i) => sum + i.price, 0)
  const myFraction = totalSubtotal > 0 ? mySubtotal / totalSubtotal : 0
  const myTotal = mySubtotal + (session?.tax || 0) * myFraction + (session?.tip || 0) * myFraction

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#5ECEB8] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-[#94A3B8]">Loading tab...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1E293B] mb-2">Oops</p>
          <p className="text-[#64748B]">{error || 'Tab not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div>
          <p className="text-xs text-[#94A3B8] font-medium">Tab by</p>
          <h1 className="font-bold text-[#1E293B] leading-tight">{session.organizer_name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F1F5F9] rounded-full px-3 py-1.5 text-xs font-medium text-[#64748B]">
            <Users size={12} />
            {participants.length}
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-[#5ECEB8] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-[#4ab8a4] transition-colors active:scale-95"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>

      {/* Join modal */}
      {showJoin && (
        <JoinModal
          sessionOrganizerName={session.organizer_name}
          onJoin={handleJoin}
          isLoading={isJoining}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 lg:p-6 max-w-6xl mx-auto w-full">
        {/* Left panel: table + summary */}
        <div className="flex flex-col gap-4 p-4 lg:p-0 lg:w-80 lg:flex-shrink-0">
          <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-sm p-6">
            <TableView
              participants={participants}
              selections={selections}
              items={items}
              myParticipantId={myParticipantId}
            />
          </div>

          <BillSummary
            session={session}
            items={items}
            selections={selections}
            participants={participants}
            myParticipantId={myParticipantId}
            onPay={() => setShowPayment(true)}
            isOrganizer={isOrganizer}
          />
        </div>

        {/* Right panel: items */}
        <div className="flex-1 p-4 lg:p-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1E293B]">
              Items <span className="text-[#94A3B8] font-normal text-sm">({items.length})</span>
            </h2>
            {myParticipantId && (
              <p className="text-sm text-[#94A3B8]">
                Tap + to claim yours
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <AnimatePresence initial={false}>
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selections={selections}
                  participants={participants}
                  myParticipantId={myParticipantId}
                  onClaim={handleClaim}
                  onRelease={handleRelease}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Tax / Tip footer */}
          {(session.tax > 0 || session.tip > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex gap-3"
            >
              {session.tax > 0 && (
                <div className="flex-1 bg-white rounded-2xl border border-[#F1F5F9] p-3 text-center">
                  <p className="text-xs text-[#94A3B8] font-medium">Tax</p>
                  <p className="font-semibold text-[#475569]">{formatCurrency(session.tax)}</p>
                  <p className="text-xs text-[#CBD5E1]">split proportionally</p>
                </div>
              )}
              {session.tip > 0 && (
                <div className="flex-1 bg-white rounded-2xl border border-[#F1F5F9] p-3 text-center">
                  <p className="text-xs text-[#94A3B8] font-medium">Tip</p>
                  <p className="font-semibold text-[#475569]">{formatCurrency(session.tip)}</p>
                  <p className="text-xs text-[#CBD5E1]">split proportionally</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && session.payment_methods.length > 0 && (
        <PaymentModal
          organizerName={session.organizer_name}
          paymentMethods={session.payment_methods}
          amount={myTotal}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}
