'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, ArrowRight, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

interface SessionSummary {
  id: string
  organizer_name: string
  created_at: string
  subtotal: number
  tax: number
  tip: number
}

interface LocalSession {
  id: string
  organizer_name: string
  created_at: string
  item_count: number
  subtotal: number
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function SessionCard({ id, organizer_name, created_at, total, index, onClose }: {
  id: string
  organizer_name: string
  created_at: string
  total: number
  index: number
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="relative group/card"
    >
      <Link
        href={`/session/${id}`}
        className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-[#F1F5F9] shadow-sm hover:shadow-md hover:border-[#5ECEB8]/40 transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#F0FDF9] flex items-center justify-center">
            <Receipt size={18} className="text-[#5ECEB8]" />
          </div>
          <span className="text-xs text-[#94A3B8] pr-4">{timeAgo(created_at)}</span>
        </div>

        <div>
          <p className="font-semibold text-[#1E293B] truncate">{organizer_name}&apos;s Tab</p>
          <p className="text-sm text-[#64748B] mt-0.5">{formatCurrency(total)}</p>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-[#5ECEB8] group-hover:gap-2 transition-all">
          Open tab <ArrowRight size={13} />
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#FFE4E4] hover:text-[#FF6B6B] flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all"
        title="Close tab"
      >
        <X size={12} />
      </button>
    </motion.div>
  )
}

export function MySessions() {
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [localSessions, setLocalSessions] = useState<LocalSession[]>([])
  const [fetching, setFetching] = useState(false)

  // Load localStorage sessions (shown when not signed in)
  useEffect(() => {
    if (user) return
    try {
      const stored: LocalSession[] = JSON.parse(localStorage.getItem('payme_sessions') || '[]')
      setLocalSessions(stored)
    } catch {
      setLocalSessions([])
    }
  }, [user])

  // Load Supabase sessions when signed in
  useEffect(() => {
    if (!user) return
    setFetching(true)
    supabase
      .from('sessions')
      .select('id, organizer_name, created_at, subtotal, tax, tip')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setSessions((data as SessionSummary[]) ?? [])
        setFetching(false)
      })
  }, [user])

  function handleCloseLocal(id: string) {
    const updated = localSessions.filter(s => s.id !== id)
    setLocalSessions(updated)
    localStorage.setItem('payme_sessions', JSON.stringify(updated))
  }

  async function handleCloseSupabase(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
    await supabase.from('sessions').delete().eq('id', id)
  }

  if (authLoading || fetching) return null

  if (user && sessions.length > 0) {
    return (
      <section className="py-10 px-4">
        <h2 className="font-bold text-[#1E293B] text-lg mb-4">Your Tables</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sessions.map((s, i) => (
              <SessionCard
                key={s.id}
                id={s.id}
                organizer_name={s.organizer_name}
                created_at={s.created_at}
                total={(s.subtotal ?? 0) + s.tax + s.tip}
                index={i}
                onClose={() => handleCloseSupabase(s.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    )
  }

  if (!user && localSessions.length > 0) {
    return (
      <section className="py-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1E293B] text-lg">Your Tables</h2>
          <p className="text-xs text-[#94A3B8]">Sign in to access these on any device</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {localSessions.map((s, i) => (
              <SessionCard
                key={s.id}
                id={s.id}
                organizer_name={s.organizer_name}
                created_at={s.created_at}
                total={s.subtotal}
                index={i}
                onClose={() => handleCloseLocal(s.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    )
  }

  return null
}
