'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from './AuthProvider'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signInWithMagicLink(email)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
        >
          <X size={20} />
        </button>

        {sent ? (
          <div className="text-center p-8">
            <div className="text-5xl mb-4">📬</div>
            <p className="font-bold text-[#1E293B] text-lg">Check your inbox</p>
            <p className="text-sm text-[#64748B] mt-2">
              We sent a sign-in link to <span className="font-medium">{email}</span>
            </p>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="font-bold text-[#1E293B] text-lg mb-1">Sign in to PayMe</h2>
            <p className="text-sm text-[#64748B] mb-6">Save your tabs and access them on any device</p>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2.5 border border-[#E2E8F0] rounded-2xl py-3 font-medium text-[#1E293B] hover:bg-[#F8FAFC] transition-colors mb-4"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-xs text-[#94A3B8]">or email</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-[#E2E8F0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#5ECEB8] transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-[#5ECEB8] text-white rounded-2xl py-3 font-semibold hover:bg-[#4ab8a4] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
