'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function Confirm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      router.replace('/')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(() => {
      router.replace(next)
    })
  }, [router, searchParams])

  return null
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#5ECEB8] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#94A3B8]">Signing you in…</p>
        <Suspense>
          <Confirm />
        </Suspense>
      </div>
    </div>
  )
}
