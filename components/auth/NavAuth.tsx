'use client'

import { useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { AuthModal } from './AuthModal'

export function NavAuth() {
  const { user, loading, signOut } = useAuth()
  const [showModal, setShowModal] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#64748B] hidden sm:block truncate max-w-[140px]">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#1E293B] transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors"
      >
        <User size={16} />
        Sign in
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  )
}
